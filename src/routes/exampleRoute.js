const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { obtenerEstadoNodos, sincronizarCon, obtenerDe, NODOS, NODOS_MAP, MI_NODO, BANCO_ID, enviarA } = require('../services/nodo.service');

router.get('/nodos/estado', async (req, res) => {
  try {
    const estados = await obtenerEstadoNodos();
    res.json({ timestamp: new Date().toISOString(), nodos: estados });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
  const tablas_permitidas = ['productos', 'categorias', 'movimientos', 'donaciones', 'entregas', 'transferencias', 'donantes', 'beneficiarios'];
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
  try {
    const { nombre, categoria_id, cantidad } = req.body;

    if (!nombre || !categoria_id || cantidad === undefined) {
      return res.status(400).json({ error: 'Faltan campos: nombre, categoria_id, cantidad' });
    }

    const [result] = await db.query(
      'INSERT INTO productos (nombre, categoria_id, cantidad) VALUES (?, ?, ?)',
      [nombre, categoria_id, cantidad]
    );

    res.status(201).json({
      mensaje: 'Producto creado',
      banco: process.env.BANCO_NAME,
      producto: {
        id: result.insertId,
        nombre,
        categoria_id,
        cantidad
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/recibir_productos', async (req, res) => {
  let conn;

  try {
    const { nombre, categoria_id, cantidad } = req.body;
    const categoriaId = Number(categoria_id);
    const cantidadNumero = Number(cantidad);

    if (!nombre || !Number.isInteger(categoriaId) || categoriaId <= 0 || !Number.isInteger(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ error: 'Faltan campos validos: nombre, categoria_id, cantidad' });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    const [rows] = await conn.query('SELECT * FROM productos WHERE nombre = ? FOR UPDATE', [nombre]);

    if (rows.length > 0) {
      await conn.query('UPDATE productos SET cantidad = cantidad + ? WHERE id = ?', [cantidadNumero, rows[0].id]);
      await conn.commit();

      return res.json({
        mensaje: 'Cantidad actualizada',
        producto: nombre,
        cantidad_sumada: cantidadNumero,
        transaccion: { estado: 'commit', operacion: 'sumar_en_destino' }
      });
    } else {
      await conn.query('INSERT INTO productos (nombre, categoria_id, cantidad) VALUES (?, ?, ?)', [nombre, categoriaId, cantidadNumero]);
      await conn.commit();

      return res.json({
        mensaje: 'Producto creado',
        producto: nombre,
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

  try {
    const { destino, producto_id, cantidad } = req.body;
    const productoId = Number(producto_id);
    const cantidadNumero = Number(cantidad);

    if (!destino || !Number.isInteger(productoId) || productoId <= 0 || !Number.isInteger(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({ error: 'Faltan campos validos: destino, producto_id, cantidad' });
    }

    const { enviarA, NODOS_MAP } = require('../services/nodo.service');
    const url_destino = NODOS_MAP[String(destino).toLowerCase()];
    if (!url_destino) {
      return res.status(400).json({ error: `Banco '${destino}' no reconocido.` });
    }

    if (url_destino === MI_NODO) {
      return res.status(400).json({ error: 'El destino no puede ser el mismo nodo origen.' });
    }

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

    await conn.query('UPDATE productos SET cantidad = cantidad - ? WHERE id = ?', [cantidadNumero, productoId]);

    const resultado = await enviarA(url_destino, '/api/recibir_productos', {
      nombre: producto.nombre,
      categoria_id: producto.categoria_id,
      cantidad: cantidadNumero
    });

    if (!resultado.exito) {
      const error = new Error('El destino no confirmo la recepcion. Inventario revertido en origen.');
      error.statusCode = 502;
      error.resultado = resultado;
      throw error;
    }

    await conn.commit();

    res.json({
      mensaje: 'Transferencia exitosa',
      origen: process.env.BANCO_NAME,
      destino,
      producto: producto.nombre,
      cantidad_transferida: cantidadNumero,
      transaccion: {
        estado: 'commit',
        origen: `${producto.cantidad} -> ${producto.cantidad - cantidadNumero}`,
        destino: 'confirmado'
      },
      resultado
    });
  } catch (error) {
    if (conn) {
      await conn.rollback().catch(rollbackError => {
        console.error('Error al revertir transferencia:', rollbackError.message);
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

module.exports = {
  NODOS,
  NODOS_MAP,
  MI_NODO,
  BANCO_ID,
  obtenerEstadoNodos,
  sincronizarCon,
  enviarA,
  obtenerDe
};

module.exports = router;
