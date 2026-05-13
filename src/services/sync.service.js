const { randomUUID } = require('crypto');
const { db } = require('../config/db');

const BANCO_ID = process.env.BANCO_ID || 'default';
const BANCO_NAME = process.env.BANCO_NAME || BANCO_ID;

const crearId = (prefijo) => `${prefijo}_${randomUUID()}`;

const serializarPayload = (payload) => JSON.stringify(payload);

const parsearPayload = (payload) => {
  if (!payload) return {};
  if (typeof payload === 'object') return payload;
  return JSON.parse(payload);
};

const asegurarColumna = async (tabla, columna, definicion) => {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS total
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
    [tabla, columna]
  );

  if (rows[0].total === 0) {
    await db.query(`ALTER TABLE ${tabla} ADD COLUMN ${columna} ${definicion}`);
  }
};

const asegurarIndice = async (tabla, indice, sql) => {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS total
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND INDEX_NAME = ?`,
    [tabla, indice]
  );

  if (rows[0].total === 0) {
    await db.query(sql);
  }
};

const asegurarInfraestructuraSync = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS transferencias (
      id INT AUTO_INCREMENT PRIMARY KEY,
      transferencia_id VARCHAR(80) NULL,
      producto_id INT NULL,
      producto_nombre VARCHAR(100) NULL,
      categoria_id INT NULL,
      cantidad INT NOT NULL DEFAULT 0,
      origen VARCHAR(100) NULL,
      destino VARCHAR(100) NULL,
      estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
      evento_id VARCHAR(80) NULL,
      error TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await asegurarColumna('transferencias', 'transferencia_id', 'VARCHAR(80) NULL');
  await asegurarColumna('transferencias', 'producto_nombre', 'VARCHAR(100) NULL');
  await asegurarColumna('transferencias', 'categoria_id', 'INT NULL');
  await asegurarColumna('transferencias', 'origen', 'VARCHAR(100) NULL');
  await asegurarColumna('transferencias', 'estado', "VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE'");
  await asegurarColumna('transferencias', 'evento_id', 'VARCHAR(80) NULL');
  await asegurarColumna('transferencias', 'error', 'TEXT NULL');
  await asegurarColumna('transferencias', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  await asegurarColumna('transferencias', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  await asegurarIndice(
    'transferencias',
    'uq_transferencias_transferencia_id',
    'CREATE UNIQUE INDEX uq_transferencias_transferencia_id ON transferencias (transferencia_id)'
  );

  await db.query(`
    CREATE TABLE IF NOT EXISTS sync_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      evento_id VARCHAR(80) NOT NULL,
      topic VARCHAR(100) NULL,
      tipo VARCHAR(60) NOT NULL,
      origen VARCHAR(100) NOT NULL,
      destino VARCHAR(100) NULL,
      payload LONGTEXT NOT NULL,
      estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
      intentos INT NOT NULL DEFAULT 0,
      ultimo_error TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_sync_events_evento_id (evento_id)
    )
  `);

  await asegurarColumna('sync_events', 'topic', 'VARCHAR(100) NULL');

  await db.query(`
    CREATE TABLE IF NOT EXISTS sync_events_recibidos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      evento_id VARCHAR(80) NOT NULL,
      tipo VARCHAR(60) NOT NULL,
      origen VARCHAR(100) NOT NULL,
      payload LONGTEXT NOT NULL,
      estado VARCHAR(30) NOT NULL DEFAULT 'recibido',
      error TEXT NULL,
      received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      applied_at TIMESTAMP NULL,
      UNIQUE KEY uq_sync_events_recibidos_evento_id (evento_id)
    )
  `);
};

const insertarTransferencia = async (conn, transferencia) => {
  await conn.query(
    `INSERT INTO transferencias (
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      transferencia.transferencia_id,
      transferencia.producto_id,
      transferencia.producto_nombre,
      transferencia.categoria_id,
      transferencia.cantidad,
      transferencia.origen,
      transferencia.destino,
      transferencia.estado,
      transferencia.evento_id,
      transferencia.error || null
    ]
  );
};

const registrarEventoSync = async (conn, evento) => {
  await conn.query(
    `INSERT INTO sync_events (
      evento_id,
      topic,
      tipo,
      origen,
      destino,
      payload,
      estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      evento.evento_id,
      evento.topic || evento.tipo,
      evento.tipo,
      evento.origen || BANCO_ID,
      evento.destino || '*',
      serializarPayload(evento.payload),
      evento.estado || 'pendiente'
    ]
  );
};

module.exports = {
  BANCO_ID,
  BANCO_NAME,
  crearId,
  serializarPayload,
  parsearPayload,
  asegurarInfraestructuraSync,
  insertarTransferencia,
  registrarEventoSync
};
