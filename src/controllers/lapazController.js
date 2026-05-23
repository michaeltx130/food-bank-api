const { lapaz } = require('../config/prisma');
const { unitParaCrear, unitParaActualizar } = require('../utils/productUnit');
const {
  crearCrud,
  datosDonacion,
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
      const data = await lapaz.categorias.findMany({
        include: { productos: true }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener categorias' });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await lapaz.categorias.findUnique({
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
      const data = await lapaz.categorias.create({ data: { nombre } });
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear categoria' });
    }
  },

  update: async (req, res) => {
    try {
      const { nombre } = req.body;
      const data = await lapaz.categorias.update({
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
      await lapaz.categorias.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: 'Categoria eliminada' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar categoria' });
    }
  }
};

// ─────────────────────────────────────────
//  BENEFICIARIOS
// ─────────────────────────────────────────
const beneficiarios = {
  getAll: async (req, res) => {
    try {
      const data = await lapaz.beneficiarios.findMany({
        include: beneficiarioInclude
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener beneficiarios' });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await lapaz.beneficiarios.findUnique({
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
      const data = await lapaz.beneficiarios.create({ data: { nombre } });
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear beneficiario' });
    }
  },

  update: async (req, res) => {
    try {
      const { nombre } = req.body;
      const data = await lapaz.beneficiarios.update({
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
      await lapaz.beneficiarios.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: 'Beneficiario eliminado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar beneficiario' });
    }
  }
};

// ─────────────────────────────────────────
//  ENTREGAS
// ─────────────────────────────────────────
const familias = {
  getAll: async (req, res) => {
    try {
      const data = await lapaz.familias.findMany({ include: familiaInclude });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener familias' });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await lapaz.familias.findUnique({
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

      const data = await crearFamiliaConBeneficiario(lapaz, familia);
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear familia' });
    }
  },

  update: async (req, res) => {
    try {
      const familia = normalizarFamiliaPayload(req.body);
      if (!familia.valido) return res.status(400).json({ error: familia.error });

      const data = await actualizarFamiliaConBeneficiario(lapaz, Number(req.params.id), familia);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar familia' });
    }
  },

  delete: async (req, res) => {
    try {
      await lapaz.familias.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: 'Familia eliminada' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar familia' });
    }
  }
};

const entregas = {
  getAll: async (req, res) => {
    try {
      const data = await lapaz.entregas.findMany({
        include: { beneficiario: true, producto: true }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener entregas' });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await lapaz.entregas.findUnique({
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
      const data = await lapaz.entregas.create({
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
      const data = await lapaz.entregas.update({
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
      await lapaz.entregas.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: 'Entrega eliminada' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar entrega' });
    }
  }
};

// ─────────────────────────────────────────
//  PRODUCTOS
// ─────────────────────────────────────────
const productos = {
  getAll: async (req, res) => {
    try {
      const data = await lapaz.productos.findMany({
        include: { categoria: true, donaciones: true, entregas: true, movimientos: true, transferencias: true }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await lapaz.productos.findUnique({
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

      const data = await lapaz.productos.create({
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

      const data = await lapaz.productos.update({
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
      await lapaz.productos.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: 'Producto eliminado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  }
};

const donantes = crearCrud(lapaz, 'donantes', {
  label: 'donante',
  buildData: datosDonante
});

const donaciones = crearCrud(lapaz, 'donaciones', {
  label: 'donacion',
  include: { producto: true },
  buildData: datosDonacion
});

const movimientos = crearCrud(lapaz, 'movimientos', {
  label: 'movimiento',
  include: { producto: true },
  buildData: datosMovimiento
});

const transferencias = crearCrud(lapaz, 'transferencias', {
  label: 'transferencia',
  include: { producto: true },
  buildData: datosTransferencia
});

module.exports = {
  categorias,
  beneficiarios,
  familias,
  entregas,
  productos,
  donaciones,
  donantes,
  movimientos,
  transferencias
};
