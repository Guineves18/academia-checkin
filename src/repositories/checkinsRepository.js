const db = require('../../database/connection');

/**
 * Verifica se já existe check-in do aluno na data informada.
 * Essa verificação duplica a proteção do UNIQUE no banco.
 */
function findCheckinHoje(usuarioId, dataHoje) {
    return db.prepare(
        'SELECT id FROM checkins WHERE usuario_id = ? AND data_checkin = ?'
    ).get(usuarioId, dataHoje);
}

/**
 * Registra um novo check-in no banco.
 */
function createCheckin(usuarioId, dataCheckin, horaCheckin) {
    return db.prepare(
        'INSERT INTO checkins (usuario_id, data_checkin, hora_checkin) VALUES (?, ?, ?)'
    ).run(usuarioId, dataCheckin, horaCheckin);
}

/**
 * Lista todos os check-ins com nome e e-mail do aluno (para a recepção).
 * Usa JOIN para combinar as duas tabelas.
 */
function findAllComAluno() {
    return db.prepare(`
        SELECT 
            checkins.id,
            usuarios.nome,
            usuarios.email,
            checkins.data_checkin,
            checkins.hora_checkin
        FROM checkins
        JOIN usuarios ON checkins.usuario_id = usuarios.id
        ORDER BY checkins.criado_em DESC
        LIMIT 50
    `).all();
}

module.exports = { findCheckinHoje, createCheckin, findAllComAluno };