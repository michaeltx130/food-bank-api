const express = require('express');
const router = express.Router();
const { categorias, beneficiarios, entregas, productos } = require('../controllers/lapazController');

// ─────────────────────────────────────────
//  CATEGORIAS
// ─────────────────────────────────────────
router.get('/categorias', categorias.getAll);
router.get('/categorias/:id', categorias.getById);
router.post('/categorias', categorias.create);
router.put('/categorias/:id', categorias.update);
router.delete('/categorias/:id', categorias.delete);

// ─────────────────────────────────────────
//  BENEFICIARIOS
// ─────────────────────────────────────────
router.get('/beneficiarios', beneficiarios.getAll);
router.get('/beneficiarios/:id', beneficiarios.getById);
router.post('/beneficiarios', beneficiarios.create);
router.put('/beneficiarios/:id', beneficiarios.update);
router.delete('/beneficiarios/:id', beneficiarios.delete);

// ─────────────────────────────────────────
//  ENTREGAS
// ─────────────────────────────────────────
router.get('/entregas', entregas.getAll);
router.get('/entregas/:id', entregas.getById);
router.post('/entregas', entregas.create);
router.put('/entregas/:id', entregas.update);
router.delete('/entregas/:id', entregas.delete);

// ─────────────────────────────────────────
//  PRODUCTOS
// ─────────────────────────────────────────
router.get('/productos', productos.getAll);
router.get('/productos/:id', productos.getById);
router.post('/productos', productos.create);
router.put('/productos/:id', productos.update);
router.delete('/productos/:id', productos.delete);

module.exports = router;