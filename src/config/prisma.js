const { PrismaMariaDb } = require('@prisma/adapter-mariadb')
const url = process.env.DATABASE_URL
const NODO_PREFIX = process.env.NODO_PREFIX

const { PrismaClient } = require(`../generated/${NODO_PREFIX}`)
const adapter = new PrismaMariaDb(url)
const client = new PrismaClient({ adapter })

module.exports = {
  comondu: client,
  lapaz: client,
  loreto: client,
  mulege: client
}