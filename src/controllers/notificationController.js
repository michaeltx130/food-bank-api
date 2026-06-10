const {
  contarNoLeidas,
  limpiarNotificaciones,
  listarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
} = require("../events/rabbitmq/notification.service");

const parseBool = (value, defaultValue) => {
  if (value === undefined) return defaultValue;
  return String(value).toLowerCase() === "true";
};

const obtenerNotificaciones = async (req, res) => {
  try {
    const limite = Math.min(Number(req.query.limite || 50), 100);
    const incluirLeidas = parseBool(req.query.incluirLeidas, true);
    const notificaciones = await listarNotificaciones({
      limite,
      incluirLeidas,
    });

    res.json({
      banco: process.env.BANCO_NAME || "Banco",
      total: notificaciones.length,
      no_leidas: contarNoLeidas(),
      notificaciones,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener notificaciones",
      detalle: error.message,
    });
  }
};

const obtenerResumen = async (req, res) => {
  try {
    const recientes = await listarNotificaciones({
      limite: Number(req.query.limite || 5),
      incluirLeidas: false,
    });

    res.json({
      banco: process.env.BANCO_NAME || "Banco",
      no_leidas: contarNoLeidas(),
      recientes,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener resumen de notificaciones",
      detalle: error.message,
    });
  }
};

const marcarLeida = (req, res) => {
  const notificacion = marcarNotificacionLeida(req.params.id);

  if (!notificacion) {
    return res.status(404).json({ error: "Notificacion no encontrada" });
  }

  return res.json({
    mensaje: "Notificacion marcada como leida",
    notificacion,
    no_leidas: contarNoLeidas(),
  });
};

const marcarLeidas = (req, res) => {
  const total = marcarTodasLeidas();

  res.json({
    mensaje: "Notificaciones marcadas como leidas",
    actualizadas: total,
    no_leidas: contarNoLeidas(),
  });
};

const limpiar = async (req, res) => {
  const eliminadas = await limpiarNotificaciones();

  res.json({
    mensaje: "Notificaciones eliminadas",
    eliminadas,
  });
};

module.exports = {
  obtenerNotificaciones,
  obtenerResumen,
  marcarLeida,
  marcarLeidas,
  limpiar,
};
