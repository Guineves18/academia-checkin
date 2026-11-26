-- Habilita limpeza de tabelas se já existirem (idempotência do seed)
DROP TABLE IF EXISTS checkins;
DROP TABLE IF EXISTS usuarios;

-- Tabela de Usuários: Alunos e Recepcionistas
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    papel TEXT NOT NULL CHECK(papel IN ('aluno', 'recepcionista')),
    plano_tipo TEXT NOT NULL CHECK(plano_tipo IN ('mensal', 'trimestral', 'anual')),
    plano_vencimento TEXT NOT NULL, -- Formato ISO: YYYY-MM-DD
    plano_status TEXT NOT NULL CHECK(plano_status IN ('ativo', 'vencido', 'cancelado')),
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Check-ins realizados
CREATE TABLE checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    data_checkin TEXT NOT NULL, -- Formato ISO: YYYY-MM-DD
    hora_checkin TEXT NOT NULL, -- Formato: HH:MM:SS
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
    
    -- Chave Estrangeira com integridade referencial:
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- RESTRIÇÃO CRÍTICA DE NEGÓCIO:
    -- Impede que o mesmo aluno registre mais de 1 check-in no mesmo dia calendário
    UNIQUE(usuario_id, data_checkin)
);