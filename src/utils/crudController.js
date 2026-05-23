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
