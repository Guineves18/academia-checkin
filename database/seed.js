/**
 * Script de Carga Inicial (Seed)
 * Cria a estrutura de tabelas e insere dados de demonstração com senhas criptografadas.
 */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('./connection');

function executarSeed() {
    console.log('Executando schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    db.exec(schemaSql);

    console.log('Gerando hashes de senha com bcrypt...');
    // Criptografia obrigatória: nunca salvar senhas em texto puro!
    const senhaPadrao = 'senha123';
    const saltRounds = 10;
    const hashComum = bcrypt.hashSync(senhaPadrao, saltRounds);

    // Datas dinâmicas para testes sempre válidos:
    const hoje = new Date();

    // Aluno ativo: vence daqui a 30 dias
    const dataFutura = new Date(hoje);
    dataFutura.setDate(hoje.getDate() + 30);
    const vencimentoAtivo = dataFutura.toISOString().split('T')[0];

    // Aluno vencido: venceu há 10 dias atrás
    const dataPassada = new Date(hoje);
    dataPassada.setDate(hoje.getDate() - 10);
    const vencimentoVencido = dataPassada.toISOString().split('T')[0];

    console.log('Inserindo usuários de teste...');
    const insertUsuario = db.prepare(`
        INSERT INTO usuarios (nome, email, senha_hash, papel, plano_tipo, plano_vencimento, plano_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // 1. Recepcionista / Administração
    insertUsuario.run('Ana Recepção', 'admin@academia.com', hashComum, 'recepcionista', 'anual', '2030-12-31', 'ativo');

    // 2. Aluno Ativo (Carlos Silva)
    const alunoAtivo = insertUsuario.run('Carlos Silva', 'carlos@email.com', hashComum, 'aluno', 'mensal', vencimentoAtivo, 'ativo');

    // 3. Aluno Vencido (Marcos Souza)
    insertUsuario.run('Marcos Souza', 'marcos@email.com', hashComum, 'aluno', 'trimestral', vencimentoVencido, 'vencido');

    console.log('Inserindo check-ins de histórico para testes...');
    const insertCheckin = db.prepare(`
        INSERT INTO checkins (usuario_id, data_checkin, hora_checkin)
        VALUES (?, ?, ?)
    `);

    // Check-in anterior (ontem) para o Carlos
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    const dataOntem = ontem.toISOString().split('T')[0];

    insertCheckin.run(alunoAtivo.lastInsertRowid, dataOntem, '08:30:00');

    console.log('Banco de dados populado com sucesso!');
    console.log('----------------------------------------------------');
    console.log('Usuários criados para teste (senha para todos: senha123):');
    console.log('  1. Recepcionista: admin@academia.com');
    console.log('  2. Aluno Ativo:   carlos@email.com (vence em:', vencimentoAtivo, ')');
    console.log('  3. Aluno Vencido: marcos@email.com (venceu em:', vencimentoVencido, ')');
    console.log('----------------------------------------------------');
}

executarSeed();