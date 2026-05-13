let amqp;

try {
  amqp = require('amqplib');
} catch (error) {
  amqp = null;
}

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const NOTIFICATIONS_QUEUE = process.env.RABBITMQ_NOTIFICATIONS_QUEUE || 'notifications';

let channelPromise;

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

  const channel = await getChannel();
  const payload = Buffer.from(JSON.stringify({
    ...mensaje,
    created_at: new Date().toISOString()
  }));

  channel.sendToQueue(NOTIFICATIONS_QUEUE, payload, { persistent: true });

  return { enviado: true, queue: NOTIFICATIONS_QUEUE };
};

module.exports = {
  enviarNotificacion
};
