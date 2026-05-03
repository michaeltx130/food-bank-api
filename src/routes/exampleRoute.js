const express = require('express');
const router = express.Router();
const { obtenerEstadoNodos, sincronizarCon, enviarA } = require('../services/nodo.service');

//Esto lo hizo una ia, es el ejemplo para todas las rutas, analizandolo con mi proyecto donde tmb use rutas es casi lo mismo

/**
 * GET /api/nodos/estado
 * Obtener el estado de todos los nodos
 */
router.get('/nodos/estado', async (req, res) => {
  try {
    const estados = await obtenerEstadoNodos();
    res.json({
      timestamp: new Date().toISOString(),
      nodos: estados
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/productos/crear
 * Crear un producto y sincronizar con otros nodos
 */
router.post('/productos/crear', async (req, res) => {
  try {
    const { nombre, cantidad, descripcion } = req.body;
    
    if (!nombre || !cantidad) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: nombre, cantidad'
      });
    }

    const producto = {
      id: Date.now(),
      nombre,
      cantidad,
      descripcion,
      createdAt: new Date().toISOString(),
      banco: process.env.BANCO_ID
    };

    // Sincronizar con otros nodos
    const sincronizacion = await sincronizarCon('/api/productos/recibir', producto);
    
    res.status(201).json({
      producto,
      sincronizacion: {
        total: sincronizacion.length,
        exitosos: sincronizacion.filter(s => !s.error).length,
        fallidos: sincronizacion.filter(s => s.error).length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/productos/recibir
 * Recibir productos sincronizados de otros nodos (interno)
 */
router.post('/productos/recibir', async (req, res) => {
  try {
    const producto = req.body;
    
    console.log(`📦 Producto recibido de ${producto.banco}: ${producto.nombre}`);
    
    // Aquí guardaría en BD local
    res.json({
      mensaje: 'Producto recibido correctamente',
      producto
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/productos
 * Obtener productos locales (ejemplo)
 */
router.get('/productos', (req, res) => {
  res.json({
    banco: process.env.BANCO_NAME,
    productos: [
      // Aquí irían los productos de la BD local
    ]
  });
});

module.exports = router;
