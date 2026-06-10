let amqp;
const { randomUUID } = require('crypto');

try {
  amqp = require('amqplib');
} catch (error) {
  amqp = null;
}

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const NOTIFICATIONS_QUEUE = process.env.RABBITMQ_NOTIFICATIONS_QUEUE || 'notifications';

let channelPromise;
const notificaciones = [];
const MAX_NOTIFICACIONES = Number(process.env.NOTIFICATIONS_MAX || 100);

const crearIdNotificacion = () => {
  if (randomUUID) return `not_${randomUUID()}`;

  return `not_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const guardarNotificacion = (mensaje) => {
  const notificacion = {
    id: mensaje.id || crearIdNotificacion(),
    tipo: mensaje.tipo || 'INFO',
    mensaje: mensaje.mensaje || '',
    transferencia_id: mensaje.transferencia_id || null,
    leida: Boolean(mensaje.leida),
    created_at: mensaje.created_at || new Date().toISOString(),
    data: mensaje.data || null
  };

  const yaExiste = notificaciones.some((item) => item.id === notificacion.id);
  if (!yaExiste) {
    notificaciones.unshift(notificacion);
  }

  if (notificaciones.length > MAX_NOTIFICACIONES) {
    notificaciones.length = MAX_NOTIFICACIONES;
  }

  return notificacion;
};

const getChannel = async () => {
  if (!amqp) {
    throw new Error('amqplib no esta instalado. Ejecuta: npm install');
  }

  if (!channelPromise) {
    channelPromise = amqp.connect(RABBITMQ_URL)
      .then(async (connection) => {
        const channel = await connection.createChannel();
        await channel.assertQueue(NOTIFICATIONS_QUEUE, { durable: true });
        return channel;
      })
      .catch((error) => {
        channelPromise = null;
        throw error;
      });
  }

  return channelPromise;
};

const enviarNotificacion = async (mensaje) => {
  if (process.env.RABBITMQ_ENABLED === 'false') {
    return { enviado: false, motivo: 'RabbitMQ deshabilitado' };
  }

  const notificacion = guardarNotificacion(mensaje);
  const channel = await getChannel();
  const payload = Buffer.from(JSON.stringify(notificacion));

  channel.sendToQueue(NOTIFICATIONS_QUEUE, payload, { persistent: true });

  return { enviado: true, queue: NOTIFICATIONS_QUEUE, notificacion };
};

const sincronizarDesdeRabbit = async (limite = MAX_NOTIFICACIONES) => {
  if (process.env.RABBITMQ_ENABLED === 'false') {
    return { sincronizadas: 0, motivo: 'RabbitMQ deshabilitado' };
  }

  const channel = await getChannel();
  let sincronizadas = 0;

  while (sincronizadas < limite) {
    const message = await channel.get(NOTIFICATIONS_QUEUE, { noAck: false });
    if (!message) break;

    try {
      const payload = JSON.parse(message.content.toString());
      guardarNotificacion(payload);
      channel.ack(message);
      sincronizadas += 1;
    } catch (error) {
      channel.ack(message);
      console.error('RabbitMQ no pudo leer notificacion:', error.message);
    }
  }

  return { sincronizadas, queue: NOTIFICATIONS_QUEUE };
};

const listarNotificaciones = async ({ incluirLeidas = true, limite = 50 } = {}) => {
  await sincronizarDesdeRabbit(limite).catch((error) => {
    console.error('RabbitMQ no pudo sincronizar notificaciones:', error.message);
  });

  return notificaciones
    .filter((notificacion) => incluirLeidas || !notificacion.leida)
    .slice(0, limite);
};

const contarNoLeidas = () =>
  notificaciones.filter((notificacion) => !notificacion.leida).length;

const marcarNotificacionLeida = (id) => {
  const notificacion = notificaciones.find((item) => item.id === id);
  if (!notificacion) return null;

  notificacion.leida = true;
  return notificacion;
};

const marcarTodasLeidas = () => {
  notificaciones.forEach((notificacion) => {
    notificacion.leida = true;
  });

  return notificaciones.length;
};

const limpiarNotificaciones = async () => {
  const total = notificaciones.length;
  notificaciones.length = 0;

  if (process.env.RABBITMQ_ENABLED !== 'false') {
    const channel = await getChannel();
    await channel.purgeQueue(NOTIFICATIONS_QUEUE);
  }

  return total;
};

module.exports = {
  enviarNotificacion,
  listarNotificaciones,
  contarNoLeidas,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  limpiarNotificaciones
};
