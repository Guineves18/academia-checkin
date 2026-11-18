const db = require('../../database/connection');

/**
 * Busca um usuário pelo e-mail para autenticação.
 * Uso de '?' previne SQL Injection — NUNCA concatene strings em SQL!
 */
function findByEmail(email) {
    return db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
}

/**
 * Busca um usuário pelo ID (usado após autenticação por JWT).
 */
function findById(id) {
    return db.prepare('SELECT id, nome, email, papel, plano_tipo, plano_vencimento, plano_status FROM usuarios WHERE id = ?').get(id);
}

module.exports = { findByEmail, findById };