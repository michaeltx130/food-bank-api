require("dotenv").config();

const mysql = require("mysql2/promise");

const CATEGORIAS_BASE = [
  [1, "Perecederos"],
  [2, "No Perecederos"],
  [3, "Refrigerados"],
  [4, "Congelados"],
  [5, "Bebidas"],
  [6, "Infantiles"],
  [7, "Higiene"],
  [8, "Otros"],
];

const TABLAS_A_LIMPIAR = [
  "sync_events_recibidos",
  "sync_events",
  "transferencias",
  "movimientos",
  "entregas",
  "donaciones",
  "productos_replica",
  "productos",
  "familias",
  "beneficiarios",
  "donantes",
  "categorias",
];

const tieneConfirmacion = () =>
  process.argv.includes("--yes") || process.env.RESET_DB_CONFIRM === "SI";

const crearConexion = () =>
  mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    multipleStatements: false,
  });

const obtenerTablasExistentes = async (conn) => {
  const [rows] = await conn.query(
    `SELECT TABLE_NAME
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = ?`,
    [process.env.DB_NAME],
  );

  return new Set(rows.map((row) => row.TABLE_NAME));
};

const limpiarTabla = async (conn, tabla) => {
  await conn.query(`TRUNCATE TABLE \`${tabla}\``);
  return tabla;
};

const insertarCategoriasBase = async (conn) => {
  await conn.query(
    "INSERT INTO categorias (id, nombre) VALUES ?",
    [CATEGORIAS_BASE],
  );
  await conn.query("ALTER TABLE categorias AUTO_INCREMENT = 9");
};

const main = async () => {
  if (!process.env.DB_NAME) {
    throw new Error("Falta DB_NAME en el archivo .env del nodo.");
  }

  if (!tieneConfirmacion()) {
    console.log("Este script borra los datos actuales de la base:");
    console.log(`  DB_NAME=${process.env.DB_NAME}`);
    console.log("");
    console.log("Para ejecutarlo de verdad agrega --yes al comando.");
    console.log("Ejemplo:");
    console.log(
      "  node --require dotenv/config scripts/reset-real-data.js dotenv_config_path=nodes/comondu.env --yes",
    );
    return;
  }

  const conn = await crearConexion();

  try {
    const tablasExistentes = await obtenerTablasExistentes(conn);
    const tablasLimpiadas = [];

    await conn.query("SET FOREIGN_KEY_CHECKS = 0");

    for (const tabla of TABLAS_A_LIMPIAR) {
      if (tablasExistentes.has(tabla)) {
        tablasLimpiadas.push(await limpiarTabla(conn, tabla));
      }
    }

    await insertarCategoriasBase(conn);
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log(`Base limpiada: ${process.env.DB_NAME}`);
    console.log(`Tablas limpiadas: ${tablasLimpiadas.join(", ")}`);
    console.log("Categorias base insertadas:");
    CATEGORIAS_BASE.forEach(([id, nombre]) => {
      console.log(`  ${id} - ${nombre}`);
    });
  } catch (error) {
    await conn.query("SET FOREIGN_KEY_CHECKS = 1").catch(() => {});
    throw error;
  } finally {
    await conn.end();
  }
};

main().catch((error) => {
  console.error(`No se pudo limpiar la base: ${error.message}`);
  process.exit(1);
});
