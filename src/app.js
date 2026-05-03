require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { probarConexion } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3001;
const BANCO_NAME = process.env.BANCO_NAME || 'Banco';
const MI_NODO = process.env.MI_NODO || `http://localhost:${PORT}`;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    mensaje: `${BANCO_NAME} funcionando`,
    nodo: MI_NODO,
    endpoints: {
      estado: '/status',
      baseDatos: '/status/db',
      nodos: '/api/nodos/estado',
      productos: '/api/productos',
      categorias: '/api/categorias',
      agregar_productos: '/api/agregar_productos',
    }
  });
});

// Rutas de salud y estado
app.get('/status', (req, res) => {
  res.json({
    banco: BANCO_NAME,
    nodo: MI_NODO,
    puerto: PORT,
    timestamp: new Date().toISOString(),
    estado: 'activo'
  });
});

app.get('/status/db', async (req, res) => {
  try {
    const datos = await probarConexion();

    res.json({
      estado: 'activo',
      ...datos
    });
  } catch (error) {
    res.status(503).json({
      estado: 'inactivo',
      error: error.message
    });
  }
});

// Rutas de ejemplo
app.use('/api', require('./routes/exampleRoute'));

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    ruta: req.originalUrl,
    endpoints: ['/', '/status', '/status/db', '/api/nodos/estado', '/api/productos']
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    mensaje: err.message
  });
});

module.exports = app;
