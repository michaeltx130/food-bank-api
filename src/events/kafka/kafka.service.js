const { db } = require('../../config/db');
const {
  BANCO_ID,
  BANCO_NAME,
  crearId,
  parsearPayload,
  asegurarInfraestructuraSync,
  insertarTransferencia,
  registrarEventoSync
} = require('../../services/sync.service');
const { enviarNotificacion } = require('../rabbitmq/notification.service');

let Kafka;

try {
  Kafka = require('kafkajs').Kafka;
} catch (error) {
  Kafka = null;
}

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092')
  .split(',')
  .map((broker) => broker.trim())
  .filter(Boolean);

const TOPICS = {
  TRANSFER_REQUESTED: 'transfer.requested',
  TRANSFER_RECEIVED: 'transfer.received',
  INVENTORY_UPDATED: 'inventory.updated'
};

let producerPromise;
let consumerStarted = false;

const kafkaDisponible = () => Boolean(Kafka);

const crearKafka = () => {
  if (!Kafka) {
    throw new Error('kafkajs no esta instalado. Ejecuta: npm install');
  }

  return new Kafka({
    clientId: `foodbank-${BANCO_ID}`,
    brokers: KAFKA_BROKERS
  });
};

const getProducer = async () => {
  if (!producerPromise) {
    const producer = crearKafka().producer();
    producerPromise = producer.connect()
      .then(() => producer)
      .catch((error) => {
        producerPromise = null;
        throw error;
      });
  }

  return producerPromise;
};

const publicarEventoKafka = async (topic, payload, key) => {
  const producer = await getProducer();
  await producer.send({
    topic,
    messages: [{
      key: key || payload.transferencia_id || payload.evento_id || BANCO_ID,
      value: JSON.stringify(payload)
    }]
  });
};

const publicarEventosPendientes = async (limite = 20) => {
  await asegurarInfraestructuraSync();

  const [eventos] = await db.query(
    `SELECT *
     FROM sync_events
     WHERE estado IN ('pendiente', 'fallido')
     ORDER BY created_at ASC
     LIMIT ?`,
    [limite]
  );

  const resultados = [];

  for (const evento of eventos) {
    try {
      const payload = parsearPayload(evento.payload);
      await publicarEventoKafka(evento.topic || evento.tipo, {
        evento_id: evento.evento_id,
        tipo: evento.tipo,
        origen: evento.origen,
        destino: evento.destino,
        payload,
        created_at: evento.created_at
      }, evento.evento_id);

      await db.query(
        `UPDATE sync_events
         SET estado = ?, intentos = intentos + 1, ultimo_error = NULL
         WHERE evento_id = ?`,
        ['enviado', evento.evento_id]
      );

      resultados.push({ evento_id: evento.evento_id, topic: evento.topic, estado: 'enviado' });
    } catch (error) {
      await db.query(
        `UPDATE sync_events
         SET estado = ?, intentos = intentos + 1, ultimo_error = ?
         WHERE evento_id = ?`,
        ['fallido', error.message, evento.evento_id]
      );

      resultados.push({ evento_id: evento.evento_id, topic: evento.topic, estado: 'fallido', error: error.message });
    }
  }

  return resultados;
};

const buscarProductoPorNombreNormalizado = async (conn, nombre) => {
  const [rows] = await conn.query(
    `SELECT *
     FROM productos
     WHERE LOWER(REPLACE(nombre, ' ', '')) = LOWER(REPLACE(?, ' ', ''))
     LIMIT 1
     FOR UPDATE`,
    [nombre]
  );

  return rows[0];
};

const registrarEventoRecibido = async (conn, evento) => {
  const [recibido] = await conn.query(
    'SELECT id FROM sync_events_recibidos WHERE evento_id = ? LIMIT 1 FOR UPDATE',
    [evento.evento_id]
  );

  if (recibido.length > 0) {
    return false;
  }

  await conn.query(
    `INSERT INTO sync_events_recibidos (
      evento_id,
      tipo,
      origen,
      payload,
      estado
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      evento.evento_id,
      evento.tipo,
      evento.origen,
      JSON.stringify(evento.payload),
      'recibido'
    ]
  );

  return true;
};

const manejarTransferRequested = async (message) => {
  const evento = JSON.parse(message.value.toString());
  const payload = evento.payload || evento;

  if (payload.origen === BANCO_ID || payload.destino !== BANCO_ID) {
    return;
  }

  let conn;

  try {
    await asegurarInfraestructuraSync();
    conn = await db.getConnection();
    await conn.beginTransaction();

    const nuevo = await registrarEventoRecibido(conn, {
      evento_id: evento.evento_id,
      tipo: TOPICS.TRANSFER_REQUESTED,
      origen: payload.origen,
      payload
    });

    if (!nuevo) {
      await conn.commit();
      return;
    }

    const productoExistente = await buscarProductoPorNombreNormalizado(conn, payload.producto_nombre);

    if (productoExistente) {
      await conn.query(
        'UPDATE productos SET cantidad = cantidad + ? WHERE id = ?',
        [payload.cantidad, productoExistente.id]
      );
    } else {
      await conn.query(
        'INSERT INTO productos (nombre, categoria_id, cantidad) VALUES (?, ?, ?)',
        [payload.producto_nombre, payload.categoria_id, payload.cantidad]
      );
    }

    await insertarTransferencia(conn, {
      transferencia_id: payload.transferencia_id,
      producto_id: payload.producto_id,
      producto_nombre: payload.producto_nombre,
      categoria_id: payload.categoria_id,
      cantidad: payload.cantidad,
      origen: payload.origen,
      destino: payload.destino,
      estado: 'RECIBIDO_DESTINO',
      evento_id: evento.evento_id
    });

    const recibidoEventoId = crearId('evt');
    await registrarEventoSync(conn, {
      evento_id: recibidoEventoId,
      topic: TOPICS.TRANSFER_RECEIVED,
      tipo: 'TRANSFER_RECEIVED',
      origen: BANCO_ID,
      destino: payload.origen,
      payload: {
        ...payload,
        recibido_por: BANCO_ID,
        recibido_por_nombre: BANCO_NAME,
        estado: 'RECIBIDO_DESTINO'
      },
      estado: 'pendiente'
    });

    await conn.query(
      `UPDATE sync_events_recibidos
       SET estado = ?, applied_at = CURRENT_TIMESTAMP
       WHERE evento_id = ?`,
      ['aplicado', evento.evento_id]
    );

    await conn.commit();
    await publicarEventosPendientes(10);

    await enviarNotificacion({
      tipo: 'TRANSFERENCIA_RECIBIDA',
      mensaje: `Transferencia ${payload.transferencia_id} recibida en ${BANCO_NAME}`,
      transferencia_id: payload.transferencia_id
    }).catch((error) => {
      console.error('RabbitMQ no pudo enviar notificacion:', error.message);
    });
  } catch (error) {
    if (conn) {
      await conn.rollback().catch((rollbackError) => {
        console.error('Error al revertir evento Kafka:', rollbackError.message);
      });
    }

    console.error('Error al procesar transfer.requested:', error.message);
  } finally {
    if (conn) conn.release();
  }
};

const manejarTransferReceived = async (message) => {
  const evento = JSON.parse(message.value.toString());
  const payload = evento.payload || evento;

  if (payload.origen !== BANCO_ID) {
    return;
  }

  await asegurarInfraestructuraSync();
  await db.query(
    `UPDATE transferencias
     SET estado = ?, error = NULL
     WHERE transferencia_id = ?`,
    ['COMPLETADO', payload.transferencia_id]
  );
};

const iniciarConsumidorKafka = async () => {
  if ((process.env.SYNC_DRIVER || 'kafka') !== 'kafka' || consumerStarted) {
    return { iniciado: false, motivo: 'Kafka deshabilitado o ya iniciado' };
  }

  const kafka = crearKafka();
  const consumer = kafka.consumer({ groupId: `foodbank-${BANCO_ID}` });

  await consumer.connect();
  await consumer.subscribe({ topic: TOPICS.TRANSFER_REQUESTED, fromBeginning: false });
  await consumer.subscribe({ topic: TOPICS.TRANSFER_RECEIVED, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (topic === TOPICS.TRANSFER_REQUESTED) {
        await manejarTransferRequested(message);
      }

      if (topic === TOPICS.TRANSFER_RECEIVED) {
        await manejarTransferReceived(message);
      }
    }
  });

  consumerStarted = true;
  return { iniciado: true, brokers: KAFKA_BROKERS };
};

module.exports = {
  TOPICS,
  kafkaDisponible,
  publicarEventoKafka,
  publicarEventosPendientes,
  iniciarConsumidorKafka
};
