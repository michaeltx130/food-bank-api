const { loreto } = require('../config/prisma');
const { unitParaCrear, unitParaActualizar } = require('../utils/productUnit');

// ─────────────────────────────────────────
//  CATEGORIAS
// ─────────────────────────────────────────
const categorias = {
  getAll: async (req, res) => {
    try {
      const data = await loreto.categorias.findMany({
        include: { productos: true }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener categorias' });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await loreto.categorias.findUnique({
        where: { id: Number(req.params.id) },
        include: { productos: true }
      });
      if (!data) return res.status(404).json({ error: 'Categoria no encontrada' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener categoria' });
    }
  },

  create: async (req, res) => {
    try {
      const { nombre } = req.body;
      const data = await loreto.categorias.create({ data: { nombre } });
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear categoria' });
    }
  },

  update: async (req, res) => {
    try {
      const { nombre } = req.body;
      const data = await loreto.categorias.update({
        where: { id: Number(req.params.id) },
        data: { nombre }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar categoria' });
    }
  },

  delete: async (req, res) => {
    try {
      await loreto.categorias.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: 'Categoria eliminada' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar categoria' });
    }
  }
};

// ─────────────────────────────────────────
//  PRODUCTOS
// ─────────────────────────────────────────
const productos = {
  getAll: async (req, res) => {
    try {
      const data = await loreto.productos.findMany({
        include: { categoria: true, transferencias: true }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await loreto.productos.findUnique({
        where: { id: Number(req.params.id) },
        include: { categoria: true, transferencias: true }
      });
      if (!data) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener producto' });
    }
  },

  create: async (req, res) => {
    try {
      const { nombre, categoria_id, cantidad, unit } = req.body;
      const unitValidada = unitParaCrear(unit);
      if (!unitValidada.valido) return res.status(400).json({ error: unitValidada.error });

      const data = await loreto.productos.create({
        data: { nombre, categoria_id, cantidad, unit: unitValidada.valor }
      });
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear producto' });
    }
  },

  update: async (req, res) => {
    try {
      const { nombre, categoria_id, cantidad, unit } = req.body;
      const unitValidada = unitParaActualizar(unit);
      if (!unitValidada.valido) return res.status(400).json({ error: unitValidada.error });
      const productoData = { nombre, categoria_id, cantidad };
      if (unitValidada.valor !== undefined) productoData.unit = unitValidada.valor;

      const data = await loreto.productos.update({
        where: { id: Number(req.params.id) },
        data: productoData
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar producto' });
    }
  },

  delete: async (req, res) => {
    try {
      await loreto.productos.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: 'Producto eliminado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  }
};

// ─────────────────────────────────────────
//  TRANSFERENCIAS
// ─────────────────────────────────────────
const transferencias = {
  getAll: async (req, res) => {
    try {
      const data = await loreto.transferencias.findMany({
        include: { producto: true }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener transferencias' });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await loreto.transferencias.findUnique({
        where: { id: Number(req.params.id) },
        include: { producto: true }
      });
      if (!data) return res.status(404).json({ error: 'Transferencia no encontrada' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener transferencia' });
    }
  },

  create: async (req, res) => {
    try {
      const { producto_id, cantidad, destino } = req.body;
      const data = await loreto.transferencias.create({
        data: { producto_id, cantidad, destino }
      });
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear transferencia' });
    }
  },

  update: async (req, res) => {
    try {
      const { producto_id, cantidad, destino } = req.body;
      const data = await loreto.transferencias.update({
        where: { id: Number(req.params.id) },
        data: { producto_id, cantidad, destino }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar transferencia' });
    }
  },

  delete: async (req, res) => {
    try {
      await loreto.transferencias.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: 'Transferencia eliminada' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar transferencia' });
    }
  }
};

module.exports = { categorias, productos, transferencias };
