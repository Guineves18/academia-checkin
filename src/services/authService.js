const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuariosRepository = require('../repositories/usuariosRepository');

function login(email, senha) {
    const usuario = usuariosRepository.findByEmail(email);

    // Mensagem genérica: não revela se o e-mail existe ou não
    if (!usuario) {
        throw { status: 401, message: 'Credenciais inválidas.' };
    }

    const senhaValida = bcrypt.compareSync(senha, usuario.senha_hash);
    if (!senhaValida) {
        throw { status: 401, message: 'Credenciais inválidas.' };
    }

    // Payload mínimo no token — nunca inclua senha_hash!
    const payload = {
        id: usuario.id,
        nome: usuario.nome,
        papel: usuario.papel
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    });

    return { token, usuario: payload };
}

module.exports = { login };