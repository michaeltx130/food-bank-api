const express = require('express');
const router = express.Router();
const { categorias, beneficiarios, familias, entregas, productos, transferencias } = require('../controllers/loretoController');

router.get('/categorias', categorias.getAll);
router.get('/categorias/:id', categorias.getById);
router.post('/categorias', categorias.create);
router.put('/categorias/:id', categorias.update);
router.delete('/categorias/:id', categorias.delete);

router.get('/beneficiarios', beneficiarios.getAll);
router.get('/beneficiarios/:id', beneficiarios.getById);
router.post('/beneficiarios', beneficiarios.create);
router.put('/beneficiarios/:id', beneficiarios.update);
router.delete('/beneficiarios/:id', beneficiarios.delete);

router.get('/familias', familias.getAll);
router.get('/familias/:id', familias.getById);
router.post('/familias', familias.create);
router.put('/familias/:id', familias.update);
router.delete('/familias/:id', familias.delete);

router.get('/entregas', entregas.getAll);
router.get('/entregas/:id', entregas.getById);
router.post('/entregas', entregas.create);
router.put('/entregas/:id', entregas.update);
router.delete('/entregas/:id', entregas.delete);

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

router.get('/donaciones', donaciones.getAll);
router.get('/donaciones/:id', donaciones.getById);
router.post('/donaciones', donaciones.create);
router.put('/donaciones/:id', donaciones.update);
router.delete('/donaciones/:id', donaciones.delete);

module.exports = router;
