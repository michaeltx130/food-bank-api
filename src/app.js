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
const NODO_PREFIX = process.env.NODO_PREFIX || 'nodo';

app.get('/', (req, res) => {
  res.json({
    mensaje: `${BANCO_NAME} funcionando`,
    nodo: MI_NODO,
    endpoints: {
      estado: '/status',
      baseDatos: '/status/db',
      productos: `/api/${NODO_PREFIX}/productos`,
      categorias: `/api/${NODO_PREFIX}/categorias`,
      estado_sync: '/api/sync/estado',
      publicar_eventos_kafka: '/api/sync/push'
    }
  });
});

// Rutas
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

app.use('/api', require('./routes/exampleRoute'));
app.use(`/api/${NODO_PREFIX}`, require(`./routes/${NODO_PREFIX}Routes`));
// app.use('/api/comondu', require('./routes/comonduRoutes'));
// app.use('/api/lapaz', require('./routes/lapazRoutes'));
// app.use('/api/loreto', require('./routes/loretoRoutes'));
// app.use('/api/mulege', require('./routes/mulegeRoutes'));

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    ruta: req.originalUrl,
    endpoints: ['/', '/status', '/status/db', '/api/nodos/estado', '/api/productos', '/api/sync/estado', '/api/sync/push']
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
