const crearCrud = (client, modelName, config = {}) => {
  const label = config.label ?? modelName;
  const include = config.include;
  const buildData = config.buildData ?? ((body) => body);

  const queryOptions = include ? { include } : {};

  return {
    getAll: async (req, res) => {
      try {
        const data = await client[modelName].findMany(queryOptions);
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: `Error al obtener ${label}` });
      }
    },

    getById: async (req, res) => {
      try {
        const data = await client[modelName].findUnique({
          where: { id: Number(req.params.id) },
          ...queryOptions
        });
        if (!data) return res.status(404).json({ error: `${label} no encontrado` });
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: `Error al obtener ${label}` });
      }
    },

    create: async (req, res) => {
      try {
        const data = await client[modelName].create({
          data: buildData(req.body),
          ...queryOptions
        });
        res.status(201).json(data);
      } catch (error) {
        res.status(500).json({ error: `Error al crear ${label}` });
      }
    },

    update: async (req, res) => {
      try {
        const data = await client[modelName].update({
          where: { id: Number(req.params.id) },
          data: buildData(req.body),
          ...queryOptions
        });
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: `Error al actualizar ${label}` });
      }
    },

    delete: async (req, res) => {
      try {
        await client[modelName].delete({ where: { id: Number(req.params.id) } });
        res.json({ message: `${label} eliminado` });
      } catch (error) {
        res.status(500).json({ error: `Error al eliminar ${label}` });
      }
    },

    getPendientes: async (req, res) => {
      try {
        const data = await client[modelName].findMany({
          where: { aprobacion: 'en_espera' },
          ...queryOptions,
          orderBy: { created_at: 'desc' }
        });
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: `Error al obtener ${label} pendientes` });
      }
    },

    aprobar: async (req, res) => {
      try {
        const { id } = req.params;
        const transferencia = await client[modelName].findUnique({
          where: { transferencia_id: id }
        });

        if (!transferencia) return res.status(404).json({ error: `${label} no encontrado` });
        if (transferencia.aprobacion !== 'en_espera') {
          return res.status(400).json({ error: `No se puede aprobar, estado actual: ${transferencia.aprobacion}` });
        }

        const data = await client[modelName].update({
          where: { transferencia_id: id },
          data: { aprobacion: 'aceptado' }
        });

        const { publicarEventoKafka, TOPICS } = require('../events/kafka/kafka.service');
        await publicarEventoKafka(TOPICS.TRANSFER_APPROVED, {
          transferencia_id: transferencia.transferencia_id,
          producto_id: transferencia.producto_id,
          producto_nombre: transferencia.producto_nombre,
          categoria_id: transferencia.categoria_id,
          cantidad: transferencia.cantidad,
          origen: transferencia.origen,
          destino: transferencia.destino,
          estado: 'APROBADO'
        });

        res.json({ mensaje: `${label} aprobada`, data });
      } catch (error) {
        res.status(500).json({ error: `Error al aprobar ${label}` });
      }
    },

    rechazar: async (req, res) => {
      try {
        const { id } = req.params;
        const { motivo } = req.body;
        const transferencia = await client[modelName].findUnique({
          where: { transferencia_id: id }
        });

        if (!transferencia) return res.status(404).json({ error: `${label} no encontrado` });
        if (transferencia.aprobacion !== 'en_espera') {
          return res.status(400).json({ error: `No se puede rechazar, estado actual: ${transferencia.aprobacion}` });
        }

        const data = await client[modelName].update({
          where: { transferencia_id: id },
          data: { aprobacion: 'denegado', error: motivo || 'Rechazado por el nodo destino' }
        });

        const { publicarEventoKafka, TOPICS } = require('../events/kafka/kafka.service');
        await publicarEventoKafka(TOPICS.TRANSFER_REJECTED, {
          transferencia_id: transferencia.transferencia_id,
          producto_id: transferencia.producto_id,
          producto_nombre: transferencia.producto_nombre,
          cantidad: transferencia.cantidad,
          origen: transferencia.origen,
          destino: transferencia.destino,
          motivo: motivo || 'Rechazado por el nodo destino',
          estado: 'RECHAZADO'
        });

        res.json({ mensaje: `${label} rechazada`, data });
      } catch (error) {
        res.status(500).json({ error: `Error al rechazar ${label}` });
      }
    }
  };
};

const datosDonante = ({ nombre, telefono }) => ({ nombre, telefono });

const datosDonacion = ({ donante, producto_id, cantidad }) => ({
  donante,
  producto_id,
  cantidad
});

const datosMovimiento = ({ producto_id, tipo, cantidad }) => ({
  producto_id,
  tipo,
  cantidad
});

const datosTransferencia = ({
  transferencia_id,
  producto_id,
  producto_nombre,
  categoria_id,
  cantidad,
  origen,
  destino,
  estado,
  evento_id,
  error
}) => ({
  transferencia_id,
  producto_id,
  producto_nombre,
  categoria_id,
  cantidad,
  origen,
  destino,
  estado,
  evento_id,
  error
});

module.exports = {
  crearCrud,
  datosDonacion,
  datosDonante,
  datosMovimiento,
  datosTransferencia
};
