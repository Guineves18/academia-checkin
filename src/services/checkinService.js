const checkinsRepository = require('../repositories/checkinsRepository');
const usuariosRepository = require('../repositories/usuariosRepository');

function realizarCheckin(usuarioId) {
    const aluno = usuariosRepository.findById(usuarioId);
    if (!aluno) {
        throw { status: 404, message: 'Aluno não encontrado.' };
    }

    // REGRA 1: Bloqueia se plano vencido ou inativo
    const hoje = new Date().toISOString().split('T')[0];
    const planoVencido = aluno.plano_status !== 'ativo' || aluno.plano_vencimento < hoje;

    if (planoVencido) {
        throw {
            status: 403,
            message: `Check-in negado: plano "${aluno.plano_status}" (vencimento: ${aluno.plano_vencimento}).`
        };
    }

    // REGRA 2: Apenas 1 check-in por dia
    const checkinExistente = checkinsRepository.findCheckinHoje(usuarioId, hoje);
    if (checkinExistente) {
        throw { status: 409, message: 'Você já realizou check-in hoje.' };
    }

    // Tudo OK — registra
    const horaCheckin = new Date().toTimeString().split(' ')[0];
    checkinsRepository.createCheckin(usuarioId, hoje, horaCheckin);

    return {
        message: 'Check-in realizado com sucesso!',
        data: hoje,
        hora: horaCheckin,
        aluno: aluno.nome
    };
}

function listarCheckins() {
    return checkinsRepository.findAllComAluno();
}

module.exports = { realizarCheckin, listarCheckins };