require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


pool.getConnection()
  .then(conn => {
    console.log(`BD conectada: ${process.env.DB_NAME}`);
    console.log(`Banco: ${process.env.BANCO_NAME}`);
    conn.release();
  })
  .catch(err => {
    console.error('XXX Error de conexión:', err.message);
    process.exit(1);
  });

module.exports = { db: pool };