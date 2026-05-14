const { comondu } = require('../config/prisma');

// ─────────────────────────────────────────
//  CATEGORIAS
// ─────────────────────────────────────────
const categorias = {
  getAll: async (req, res) => {
    try {
      const data = await comondu.categorias.findMany({
        include: { productos: true }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener categorias' });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await comondu.categorias.findUnique({
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
      const data = await comondu.categorias.create({ data: { nombre } });
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear categoria' });
    }
  },

  update: async (req, res) => {
    try {
      const { nombre } = req.body;
      const data = await comondu.categorias.update({
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
      await comondu.categorias.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: 'Categoria eliminada' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar categoria' });
    }
  }
};

// ─────────────────────────────────────────
//  DONANTES
// ─────────────────────────────────────────
const donantes = {
  getAll: async (req, res) => {
    try {
      const data = await comondu.donantes.findMany();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener donantes' });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await comondu.donantes.findUnique({
        where: { id: Number(req.params.id) }
      });
      if (!data) return res.status(404).json({ error: 'Donante no encontrado' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener donante' });
    }
  },

  create: async (req, res) => {
    try {
      const { nombre, telefono } = req.body;
      const data = await comondu.donantes.create({ data: { nombre, telefono } });
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear donante' });
    }
  },

  update: async (req, res) => {
    try {
      const { nombre, telefono } = req.body;
      const data = await comondu.donantes.update({
        where: { id: Number(req.params.id) },
        data: { nombre, telefono }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar donante' });
    }
  },

  delete: async (req, res) => {
    try {
      await comondu.donantes.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: 'Donante eliminado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar donante' });
    }
  }
};

// ─────────────────────────────────────────
//  MOVIMIENTOS
// ─────────────────────────────────────────
const movimientos = {
  getAll: async (req, res) => {
    try {
      const data = await comondu.movimientos.findMany({
        include: { producto: true }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener movimientos' });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await comondu.movimientos.findUnique({
        where: { id: Number(req.params.id) },
        include: { producto: true }
      });
      if (!data) return res.status(404).json({ error: 'Movimiento no encontrado' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener movimiento' });
    }
  },

  create: async (req, res) => {
    try {
      const { producto_id, tipo, cantidad } = req.body;
      const data = await comondu.movimientos.create({
        data: { producto_id, tipo, cantidad }
      });
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear movimiento' });
    }
  },

  update: async (req, res) => {
    try {
      const { producto_id, tipo, cantidad } = req.body;
      const data = await comondu.movimientos.update({
        where: { id: Number(req.params.id) },
        data: { producto_id, tipo, cantidad }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar movimiento' });
    }
  },

  delete: async (req, res) => {
    try {
      await comondu.movimientos.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: 'Movimiento eliminado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar movimiento' });
    }
  }
};

// ─────────────────────────────────────────
//  PRODUCTOS
// ─────────────────────────────────────────
const productos = {
  getAll: async (req, res) => {
    try {
      const data = await comondu.productos.findMany({
        include: { categoria: true, movimientos: true }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await comondu.productos.findUnique({
        where: { id: Number(req.params.id) },
        include: { categoria: true, movimientos: true }
      });
      if (!data) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener producto' });
    }
  },

  create: async (req, res) => {
    try {
      const { nombre, categoria_id, cantidad } = req.body;
      const data = await comondu.productos.create({
        data: { nombre, categoria_id, cantidad }
      });
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear producto' });
    }
  },

  update: async (req, res) => {
    try {
      const { nombre, categoria_id, cantidad } = req.body;
      const data = await comondu.productos.update({
        where: { id: Number(req.params.id) },
        data: { nombre, categoria_id, cantidad }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar producto' });
    }
  },

  delete: async (req, res) => {
    try {
      await comondu.productos.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: 'Producto eliminado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  }
};

module.exports = { categorias, donantes, movimientos, productos };