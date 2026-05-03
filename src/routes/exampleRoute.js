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
  try {
    const { nombre, categoria_id, cantidad } = req.body;

    const [rows] = await db.query('SELECT * FROM productos WHERE nombre = ?', [nombre]);

    if (rows.length > 0) {
      await db.query('UPDATE productos SET cantidad = cantidad + ? WHERE nombre = ?', [cantidad, nombre]);
      res.json({ mensaje: 'Cantidad actualizada', producto: nombre, cantidad_sumada: cantidad });
    } else {
      await db.query('INSERT INTO productos (nombre, categoria_id, cantidad) VALUES (?, ?, ?)', [nombre, categoria_id, cantidad]);
      res.json({ mensaje: 'Producto creado', producto: nombre, cantidad });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  try {
    const { destino, producto_id, cantidad } = req.body;

    if (!destino || !producto_id || !cantidad) {
      return res.status(400).json({ error: 'Faltan campos: destino, producto_id, cantidad' });
    }

    // 1. Verificar que hay suficiente cantidad en origen
    const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [producto_id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });

    const producto = rows[0];
    if (producto.cantidad < cantidad) {
      return res.status(400).json({ error: `Stock insuficiente. Disponible: ${producto.cantidad}` });
    }

    // 2. Restar en origen
    await db.query('UPDATE productos SET cantidad = cantidad - ? WHERE id = ?', [cantidad, producto_id]);

    // 3. Enviar al destino para que sume
    const { enviarA, NODOS_MAP } = require('../services/nodo.service');
    const url_destino = NODOS_MAP[destino.toLowerCase()];
    if (!url_destino) {
      return res.status(400).json({ error: `Banco '${destino}' no reconocido.` });
    }

    const resultado = await enviarA(url_destino, '/api/recibir_productos', {
      nombre: producto.nombre,
      categoria_id: producto.categoria_id,
      cantidad
    });

    res.json({
      mensaje: resultado.exito ? 'Transferencia exitosa' : 'Error al enviar al destino',
      origen: process.env.BANCO_NAME,
      destino,
      producto: producto.nombre,
      cantidad_transferida: cantidad,
      resultado
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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