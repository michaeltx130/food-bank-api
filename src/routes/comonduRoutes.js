const express = require('express');
const router = express.Router();
const { categorias, donantes, movimientos, productos } = require('../controllers/comonduController');

// ─────────────────────────────────────────
//  CATEGORIAS
// ─────────────────────────────────────────
router.get('/categorias', categorias.getAll);
router.get('/categorias/:id', categorias.getById);
router.post('/categorias', categorias.create);
router.put('/categorias/:id', categorias.update);
router.delete('/categorias/:id', categorias.delete);

// ─────────────────────────────────────────
//  DONANTES
// ─────────────────────────────────────────
router.get('/donantes', donantes.getAll);
router.get('/donantes/:id', donantes.getById);
router.post('/donantes', donantes.create);
router.put('/donantes/:id', donantes.update);
router.delete('/donantes/:id', donantes.delete);

// ─────────────────────────────────────────
//  MOVIMIENTOS
// ─────────────────────────────────────────
router.get('/movimientos', movimientos.getAll);
router.get('/movimientos/:id', movimientos.getById);
router.post('/movimientos', movimientos.create);
router.put('/movimientos/:id', movimientos.update);
router.delete('/movimientos/:id', movimientos.delete);

// ─────────────────────────────────────────
//  PRODUCTOS
// ─────────────────────────────────────────
router.get('/productos', productos.getAll);
router.get('/productos/:id', productos.getById);
router.post('/productos', productos.create);
router.put('/productos/:id', productos.update);
router.delete('/productos/:id', productos.delete);

module.exports = router;