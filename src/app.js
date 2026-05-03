require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const BANCO_NAME = process.env.BANCO_NAME || 'Banco';
const MI_NODO = process.env.MI_NODO || `http://localhost:${PORT}`;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar servicios
const { db } = require('./config/db');
const { NODOS } = require('./services/nodo.service');

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

// Rutas de ejemplo
app.use('/api', require('./routes/exampleRoute'));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    mensaje: err.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n ${BANCO_NAME} iniciado`);
  console.log(` URL: ${MI_NODO}`);
  console.log(` Puerto: ${PORT}\n`);
});

module.exports = app;
