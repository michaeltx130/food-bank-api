const { mulege } = require('../config/prisma');
const { unitParaCrear, unitParaActualizar } = require('../utils/productUnit');
const {
  crearCrud,
  datosDonante,
  datosMovimiento,
  datosTransferencia
} = require('../utils/crudController');
const {
  actualizarFamiliaConBeneficiario,
  beneficiarioInclude,
  crearFamiliaConBeneficiario,
  familiaInclude,
  normalizarFamiliaPayload
} = require('../utils/familiaPayload');

// ─────────────────────────────────────────
//  CATEGORIAS
// ─────────────────────────────────────────
const categorias = {
  getAll: async (req, res) => {
    try {
      const data = await mulege.categorias.findMany({
        include: { productos: true }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener categorias' });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await mulege.categorias.findUnique({
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
      const data = await mulege.categorias.create({ data: { nombre } });
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear categoria' });
    }
  },

  update: async (req, res) => {
    try {
      const { nombre } = req.body;
      const data = await mulege.categorias.update({
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
      await mulege.categorias.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: 'Categoria eliminada' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar categoria' });
    }
  }
};

// ─────────────────────────────────────────
//  DONACIONES
// ─────────────────────────────────────────
const beneficiarios = {
  getAll: async (req, res) => {
    try {
      const data = await mulege.beneficiarios.findMany({
        include: beneficiarioInclude
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener beneficiarios' });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await mulege.beneficiarios.findUnique({
        where: { id: Number(req.params.id) },
        include: beneficiarioInclude
      });
      if (!data) return res.status(404).json({ error: 'Beneficiario no encontrado' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener beneficiario' });
    }
  },

  create: async (req, res) => {
    try {
      const { nombre } = req.body;
      const data = await mulege.beneficiarios.create({ data: { nombre } });
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear beneficiario' });
    }
  },

  update: async (req, res) => {
    try {
      const { nombre } = req.body;
      const data = await mulege.beneficiarios.update({
        where: { id: Number(req.params.id) },
        data: { nombre }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar beneficiario' });
    }
  },

  delete: async (req, res) => {
    try {
      await mulege.beneficiarios.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: 'Beneficiario eliminado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar beneficiario' });
    }
  }
};

const familias = {
  getAll: async (req, res) => {
    try {
      const data = await mulege.familias.findMany({ include: familiaInclude });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener familias' });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await mulege.familias.findUnique({
        where: { id: Number(req.params.id) },
        include: familiaInclude
      });
      if (!data) return res.status(404).json({ error: 'Familia no encontrada' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener familia' });
    }
  },

  create: async (req, res) => {
    try {
      const familia = normalizarFamiliaPayload(req.body);
      if (!familia.valido) return res.status(400).json({ error: familia.error });

      const data = await crearFamiliaConBeneficiario(mulege, familia);
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear familia' });
    }
  },

  update: async (req, res) => {
    try {
      const familia = normalizarFamiliaPayload(req.body);
      if (!familia.valido) return res.status(400).json({ error: familia.error });

      const data = await actualizarFamiliaConBeneficiario(mulege, Number(req.params.id), familia);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar familia' });
    }
  },

  delete: async (req, res) => {
    try {
      await mulege.familias.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: 'Familia eliminada' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar familia' });
    }
  }
};

const entregas = {
  getAll: async (req, res) => {
    try {
      const data = await mulege.entregas.findMany({
        include: { beneficiario: true, producto: true }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener entregas' });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await mulege.entregas.findUnique({
        where: { id: Number(req.params.id) },
        include: { beneficiario: true, producto: true }
      });
      if (!data) return res.status(404).json({ error: 'Entrega no encontrada' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener entrega' });
    }
  },

  create: async (req, res) => {
    try {
      const { beneficiario_id, producto_id, cantidad } = req.body;
      const data = await mulege.entregas.create({
        data: { beneficiario_id, producto_id, cantidad }
      });
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear entrega' });
    }
  },

  update: async (req, res) => {
    try {
      const { beneficiario_id, producto_id, cantidad } = req.body;
      const data = await mulege.entregas.update({
        where: { id: Number(req.params.id) },
        data: { beneficiario_id, producto_id, cantidad }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar entrega' });
    }
  },

  delete: async (req, res) => {
    try {
      await mulege.entregas.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: 'Entrega eliminada' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar entrega' });
    }
  }
};

const donaciones = {
  getAll: async (req, res) => {
    try {
      const data = await mulege.donaciones.findMany({
        include: { producto: true }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener donaciones' });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await mulege.donaciones.findUnique({
        where: { id: Number(req.params.id) },
        include: { producto: true }
      });
      if (!data) return res.status(404).json({ error: 'Donacion no encontrada' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener donacion' });
    }
  },

  create: async (req, res) => {
    try {
      const { donante, producto_id, cantidad } = req.body;
      const data = await mulege.donaciones.create({
        data: { donante, producto_id, cantidad }
      });
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear donacion' });
    }
  },

  update: async (req, res) => {
    try {
      const { donante, producto_id, cantidad } = req.body;
      const data = await mulege.donaciones.update({
        where: { id: Number(req.params.id) },
        data: { donante, producto_id, cantidad }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar donacion' });
    }
  },

  delete: async (req, res) => {
    try {
      await mulege.donaciones.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: 'Donacion eliminada' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar donacion' });
    }
  }
};

// ─────────────────────────────────────────
//  PRODUCTOS
// ─────────────────────────────────────────
const productos = {
  getAll: async (req, res) => {
    try {
      const data = await mulege.productos.findMany({
        include: { categoria: true, donaciones: true, entregas: true, movimientos: true, transferencias: true }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await mulege.productos.findUnique({
        where: { id: Number(req.params.id) },
        include: { categoria: true, donaciones: true, entregas: true, movimientos: true, transferencias: true }
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

      const data = await mulege.productos.create({
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

      const data = await mulege.productos.update({
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
      await mulege.productos.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: 'Producto eliminado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  }
};

const donantes = crearCrud(mulege, 'donantes', {
  label: 'donante',
  buildData: datosDonante
});

const movimientos = crearCrud(mulege, 'movimientos', {
  label: 'movimiento',
  include: { producto: true },
  buildData: datosMovimiento
});

const transferencias = crearCrud(mulege, 'transferencias', {
  label: 'transferencia',
  include: { producto: true },
  buildData: datosTransferencia
});

module.exports = {
  categorias,
  beneficiarios,
  familias,
  entregas,
  donaciones,
  productos,
  donantes,
  movimientos,
  transferencias
};
