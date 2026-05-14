const express = require('express');
const router = express.Router();
const { categorias, productos, transferencias } = require('../controllers/loretoController');

router.get('/categorias', categorias.getAll);
router.get('/categorias/:id', categorias.getById);
router.post('/categorias', categorias.create);
router.put('/categorias/:id', categorias.update);
router.delete('/categorias/:id', categorias.delete);

router.get('/productos', productos.getAll);
router.get('/productos/:id', productos.getById);
router.post('/productos', productos.create);
router.put('/productos/:id', productos.update);
router.delete('/productos/:id', productos.delete);

router.get('/transferencias', transferencias.getAll);
router.get('/transferencias/:id', transferencias.getById);
router.post('/transferencias', transferencias.create);
router.put('/transferencias/:id', transferencias.update);
router.delete('/transferencias/:id', transferencias.delete);

module.exports = router;