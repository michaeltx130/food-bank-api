const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { obtenerEstadoNodos, obtenerDe, MI_NODO, BANCO_ID } = require('../services/nodo.service');
const {
  BANCO_NAME,
  crearId,
  asegurarInfraestructuraSync,
  insertarTransferencia,
  registrarEventoSync
} = require('../services/sync.service');
const {
  TOPICS,
  kafkaDisponible,
  publicarEventosPendientes
} = require('../events/kafka/kafka.service');
const { unitParaCrear } = require('../utils/productUnit');

const normalizarNombreProducto = (nombre) => String(nombre).toLowerCase().replace(/\s+/g, '');

const buscarProductoPorNombreNormalizado = async (conn, nombre) => {
  const [rows] = await conn.query(
    `SELECT *
     FROM productos
     WHERE LOWER(REPLACE(nombre, ' ', '')) = ?
     LIMIT 1
     FOR UPDATE`,
    [normalizarNombreProducto(nombre)]
  );

  return rows[0];
};

router.get('/nodos/estado', async (req, res) => {
  try {
    const estados = await obtenerEstadoNodos();
    res.json({ timestamp: new Date().toISOString(), nodos: estados });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sync/estado', (req, res) => {
  res.json({
    banco: process.env.BANCO_NAME,
    sync_driver: process.env.SYNC_DRIVER || 'kafka',
    kafka: {
      disponible: kafkaDisponible(),
      brokers: process.env.KAFKA_BROKERS || 'localhost:9092'
    },
    rabbitmq: {
      habilitado: process.env.RABBITMQ_ENABLED !== 'false',
      url: process.env.RABBITMQ_URL || 'amqp://localhost:5672'
    }
  });
});

/////////////////////////////////////////  Tablas Locales /////////////////////////////////////////////////////

router.get('/productos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos');
    res.json({ banco: process.env.BANCO_NAME, productos: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/categorias', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categorias');
    res.json({ banco: process.env.BANCO_NAME, categorias: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tabla/:nombre', async (req, res) => {
  const tablas_permitidas = [
    'productos',
    'categorias',
    'movimientos',
    'donaciones',
    'entregas',
    'transferencias',
    'donantes',
    'beneficiarios',
    'sync_events',
    'sync_events_recibidos'
  ];
  const tabla = req.params.nombre;

  if (!tablas_permitidas.includes(tabla)) {
    return res.status(400).json({ error: `Tabla '${tabla}' no permitida` });
  }

  try {
    const [rows] = await db.query(`SELECT * FROM ??`, [tabla]);
    res.json({ banco: process.env.BANCO_NAME, tabla, datos: rows });
  } catch (error) {
    res.status(404).json({ banco: process.env.BANCO_NAME, tabla, error: `Tabla no existe en este banco` });
  }
});

router.post('/agregar_productos', async (req, res) => {
  let conn;

  try {
    const { nombre, categoria_id, cantidad, unit } = req.body;
    const categoriaId = Number(categoria_id);
    const cantidadNumero = Number(cantidad);
    const unitValidada = unitParaCrear(unit);

    if (!nombre || !Number.isInteger(categoriaId) || categoriaId <= 0 || !Number.isInteger(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ error: 'Faltan campos validos: nombre, categoria_id, cantidad' });
    }

    if (!unitValidada.valido) {
      return res.status(400).json({ error: unitValidada.error });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    const productoExistente = await buscarProductoPorNombreNormalizado(conn, nombre);

    if (productoExistente) {
      await conn.query(
        'UPDATE productos SET cantidad = cantidad + ? WHERE id = ?',
        [cantidadNumero, productoExistente.id]
      );
      await conn.commit();

      return res.json({
        mensaje: 'Cantidad actualizada',
        banco: process.env.BANCO_NAME,
        producto: {
          id: productoExistente.id,
          nombre: productoExistente.nombre,
          categoria_id: productoExistente.categoria_id,
          unit: productoExistente.unit,
          cantidad_anterior: productoExistente.cantidad,
          cantidad_sumada: cantidadNumero,
          cantidad_actual: productoExistente.cantidad + cantidadNumero
        }
      });
    }

    const [result] = await conn.query(
      'INSERT INTO productos (nombre, categoria_id, cantidad, unit) VALUES (?, ?, ?, ?)',
      [nombre, categoriaId, cantidadNumero, unitValidada.valor]
    );
    await conn.commit();

    return res.status(201).json({
      mensaje: 'Producto creado',
      banco: process.env.BANCO_NAME,
      producto: {
        id: result.insertId,
        nombre,
        categoria_id: categoriaId,
        unit: unitValidada.valor,
        cantidad: cantidadNumero
      }
    });
  } catch (error) {
    if (conn) {
      await conn.rollback().catch(rollbackError => {
        console.error('Error al revertir alta de producto:', rollbackError.message);
      });
    }

    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

router.post('/recibir_productos', async (req, res) => {
  let conn;

  try {
    const { nombre, categoria_id, cantidad, unit } = req.body;
    const categoriaId = Number(categoria_id);
    const cantidadNumero = Number(cantidad);
    const unitValidada = unitParaCrear(unit);

    if (!nombre || !Number.isInteger(categoriaId) || categoriaId <= 0 || !Number.isInteger(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ error: 'Faltan campos validos: nombre, categoria_id, cantidad' });
    }

    if (!unitValidada.valido) {
      return res.status(400).json({ error: unitValidada.error });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    const productoExistente = await buscarProductoPorNombreNormalizado(conn, nombre);

    if (productoExistente) {
      await conn.query('UPDATE productos SET cantidad = cantidad + ? WHERE id = ?', [cantidadNumero, productoExistente.id]);
      await conn.commit();

      return res.json({
        mensaje: 'Cantidad actualizada',
        producto: productoExistente.nombre,
        unit: productoExistente.unit,
        cantidad_sumada: cantidadNumero,
        transaccion: { estado: 'commit', operacion: 'sumar_en_destino' }
      });
    } else {
      await conn.query('INSERT INTO productos (nombre, categoria_id, cantidad, unit) VALUES (?, ?, ?, ?)', [nombre, categoriaId, cantidadNumero, unitValidada.valor]);
      await conn.commit();

      return res.json({
        mensaje: 'Producto creado',
        producto: nombre,
        unit: unitValidada.valor,
        cantidad: cantidadNumero,
        transaccion: { estado: 'commit', operacion: 'crear_en_destino' }
      });
    }
  } catch (error) {
    if (conn) {
      await conn.rollback().catch(rollbackError => {
        console.error('Error al revertir recepcion:', rollbackError.message);
      });
    }

    res.status(500).json({
      error: error.message,
      transaccion: { estado: 'rollback', operacion: 'recibir_producto' }
    });
  } finally {
    if (conn) conn.release();
  }
});

/////////////////////////////////////////  Tablas En Red /////////////////////////////////////////////////////

router.get('/red/productos', async (req, res) => {
  try {
    const { NODOS } = require('../services/nodo.service');
    const resultados = await Promise.all(
      NODOS.map(nodo => obtenerDe(nodo, '/api/productos'))
    );
    res.json({ timestamp: new Date().toISOString(), red: resultados });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/red/tabla/:nombre', async (req, res) => {
  try {
    const { NODOS } = require('../services/nodo.service');
    const tabla = req.params.nombre;
    const resultados = await Promise.all(
      NODOS.map(nodo => obtenerDe(nodo, `/api/tabla/${tabla}`))
    );
    res.json({ timestamp: new Date().toISOString(), tabla, red: resultados });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/red/productos/enviar', async (req, res) => {
  let conn;
  let transferenciaFallida;

  try {
    const { destino, producto_id, cantidad } = req.body;
    const productoId = Number(producto_id);
    const cantidadNumero = Number(cantidad);

    if (!destino || !Number.isInteger(productoId) || productoId <= 0 || !Number.isInteger(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ error: 'Faltan campos validos: destino, producto_id, cantidad' });
    }

    const { NODOS_MAP } = require('../services/nodo.service');
    const url_destino = NODOS_MAP[String(destino).toLowerCase()];
    if (!url_destino) {
      return res.status(400).json({ error: `Banco '${destino}' no reconocido.` });
    }

    if (url_destino === MI_NODO) {
      return res.status(400).json({ error: 'El destino no puede ser el mismo nodo origen.' });
    }

    await asegurarInfraestructuraSync();

    const transferenciaId = crearId('trf');
    const eventoId = crearId('evt');

    conn = await db.getConnection();
    await conn.beginTransaction();

    // Bloquea el producto mientras se valida y se descuenta el inventario.
    const [rows] = await conn.query('SELECT * FROM productos WHERE id = ? FOR UPDATE', [productoId]);
    if (rows.length === 0) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const producto = rows[0];
    if (producto.cantidad < cantidadNumero) {
      const error = new Error(`Stock insuficiente. Disponible: ${producto.cantidad}`);
      error.statusCode = 400;
      throw error;
    }

    transferenciaFallida = {
      transferencia_id: transferenciaId,
      producto_id: productoId,
      producto_nombre: producto.nombre,
      producto_unit: producto.unit,
      categoria_id: producto.categoria_id,
      cantidad: cantidadNumero,
      origen: BANCO_ID,
      destino: String(destino).toLowerCase(),
      estado: 'FALLIDO',
      evento_id: eventoId
    };

    await insertarTransferencia(conn, {
      ...transferenciaFallida,
      estado: 'PENDIENTE'
    });

    await conn.query('UPDATE productos SET cantidad = cantidad - ? WHERE id = ?', [cantidadNumero, productoId]);
    await conn.query(
      'UPDATE transferencias SET estado = ? WHERE transferencia_id = ?',
      ['DESCONTADO_ORIGEN', transferenciaId]
    );

    const payloadEvento = {
      transferencia_id: transferenciaId,
      producto_id: productoId,
      producto_nombre: producto.nombre,
      producto_unit: producto.unit,
      categoria_id: producto.categoria_id,
      cantidad: cantidadNumero,
      origen: BANCO_ID,
      origen_nombre: BANCO_NAME,
      destino: String(destino).toLowerCase(),
      destino_url: url_destino,
      estado: 'DESCONTADO_ORIGEN'
    };

    await registrarEventoSync(conn, {
      evento_id: eventoId,
      topic: TOPICS.TRANSFER_REQUESTED,
      tipo: 'TRANSFER_REQUESTED',
      origen: BANCO_ID,
      destino: String(destino).toLowerCase(),
      payload: payloadEvento,
      estado: 'pendiente'
    });

    await conn.commit();

    let eventosKafka = [];
    let advertenciaKafka;

    try {
      eventosKafka = await publicarEventosPendientes(10);
    } catch (error) {
      advertenciaKafka = `La transferencia quedo en outbox pendiente de publicar: ${error.message}`;
    }

    return res.status(202).json({
      mensaje: advertenciaKafka || 'Transferencia registrada y publicada en Kafka',
      modo: 'kafka',
      origen: process.env.BANCO_NAME,
      destino,
      transferencia_id: transferenciaId,
      evento_id: eventoId,
      producto: producto.nombre,
      unit: producto.unit,
      cantidad_transferida: cantidadNumero,
      transaccion: {
        estado: 'commit',
        origen: `${producto.cantidad} -> ${producto.cantidad - cantidadNumero}`,
        destino: 'pendiente_por_evento_kafka'
      },
      eventosKafka,
      advertencia: advertenciaKafka
    });
  } catch (error) {
    if (conn) {
      await conn.rollback().catch(rollbackError => {
        console.error('Error al revertir transferencia:', rollbackError.message);
      });
    }

    if (transferenciaFallida) {
      await insertarTransferencia(db, {
        ...transferenciaFallida,
        error: error.message
      }).catch(logError => {
        console.error('Error al registrar transferencia fallida:', logError.message);
      });
    }

    res.status(error.statusCode || 500).json({
      error: error.message,
      origen: process.env.BANCO_NAME,
      destino: req.body.destino,
      transaccion: {
        estado: 'rollback',
        origen: 'sin cambios confirmados'
      },
      resultado: error.resultado
    });
  } finally {
    if (conn) conn.release();
  }
});

/////////////////////////////////////////  Sincronizacion /////////////////////////////////////////////////////

router.post('/sync/push', async (req, res) => {
  try {
    const limitBody = req.body?.limit;
    const limite = Math.min(Number(limitBody || req.query.limit || 20), 100);

    await asegurarInfraestructuraSync();

    const resultados = await publicarEventosPendientes(limite);

    return res.json({
      banco: process.env.BANCO_NAME,
      modo: 'kafka',
      eventos_procesados: resultados.length,
      resultados
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
