/**
 * Módulo de Conexão com SQLite
 * Utiliza better-sqlite3 e força a ativação de chaves estrangeiras.
 */
const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH
    ? path.resolve(__dirname, '..', process.env.DB_PATH)
    : path.resolve(__dirname, 'academia.db');

const db = new Database(dbPath);

// O SQLite por padrão vem com foreign keys DESABILITADAS.
// É obrigatório executar este PRAGMA em cada conexão:
db.pragma('foreign_keys = ON');

module.exports = db;