# 🏋️ Sistema de Check-in de Academia

> **Regra principal:** O servidor recusa o registro de check-in caso a data atual ultrapasse a data de vencimento do plano do aluno ou caso o plano esteja com status inativo.

Sistema web full-stack em 3 camadas desenvolvido com **Node.js + Express + SQLite**, com autenticação JWT, controle de acesso por papel (RBAC) e interface web em Vanilla JS.

---

## 📋 Funcionalidades

- **Autenticação segura** com JWT e senhas criptografadas via `bcrypt`
- **Controle de acesso por papel** (`aluno` e `recepcionista`)
- **Regra de plano vencido**: bloqueia check-in se `plano_status ≠ 'ativo'` ou `plano_vencimento < data_atual`
- **Regra de 1 check-in por dia**: impede duplicidade via `UNIQUE(usuario_id, data_checkin)` no banco
- **Painel do aluno**: realiza check-in e vê feedback em tempo real
- **Painel da recepção**: visualiza histórico de check-ins de todos os alunos
- **Rate limiting**: máximo 100 requisições por IP a cada 15 minutos
- **Headers de segurança**: `helmet` configurado em todas as rotas

---

## 🏗️ Arquitetura em 3 Camadas

```
┌─────────────────────────────┐
│   Apresentação (public/)    │  HTML + CSS + Vanilla JS
├─────────────────────────────┤
│   Aplicação (src/)          │  Routes → Services → Repositories
├─────────────────────────────┤
│   Dados (database/)         │  SQLite via better-sqlite3
└─────────────────────────────┘
```

### Estrutura de pastas

```
academia-checkin/
├── database/
│   ├── schema.sql              # DDL: tabelas, CHECK, UNIQUE, FOREIGN KEY
│   ├── connection.js           # Conexão SQLite com foreign_keys = ON
│   └── seed.js                 # Script de carga inicial com dados de teste
├── src/
│   ├── middlewares/
│   │   ├── authMiddleware.js   # Valida token JWT
│   │   └── rbacMiddleware.js   # Controla acesso por papel
│   ├── repositories/
│   │   ├── usuariosRepository.js   # Consultas SQL parametrizadas (usuários)
│   │   └── checkinsRepository.js   # Consultas SQL parametrizadas (check-ins)
│   ├── services/
│   │   ├── authService.js      # Lógica de autenticação e geração de JWT
│   │   └── checkinService.js   # Regras de negócio do check-in
│   ├── routes/
│   │   ├── authRoutes.js       # POST /api/auth/login
│   │   └── checkinRoutes.js    # POST e GET /api/checkin
│   └── server.js               # Express + middlewares de segurança
├── public/
│   ├── index.html              # Interface web (4 estados)
│   ├── css/style.css           # Estilização responsiva
│   └── js/app.js               # Lógica front-end (fetch, JWT, navegação)
├── .env.example                # Modelo de variáveis de ambiente
└── package.json
```

---

## 🚀 Como Executar

### Pré-requisitos
- [Node.js](https://nodejs.org/) v18 ou superior
- Git

### 1. Clone o repositório

```bash
git clone https://github.com/Guineves18/academia-checkin.git
cd academia-checkin
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha os valores:

```bash
cp .env.example .env
```

Edite o `.env`:

```env
PORT=3000
JWT_SECRET=sua_chave_secreta_aqui
DB_PATH=./database/academia.db
```

### 4. Popule o banco de dados

```bash
npm run seed
```

Saída esperada:
```
✅ Banco de dados populado com sucesso!
----------------------------------------------------
Usuários criados para teste (senha para todos: senha123):
  1. Recepcionista: admin@academia.com
  2. Aluno Ativo:   carlos@email.com
  3. Aluno Vencido: marcos@email.com
----------------------------------------------------
```

### 5. Inicie o servidor

```bash
npm start
```

Acesse: **http://localhost:3000**

---

## 👤 Usuários de Teste

| Papel | E-mail | Senha | Situação |
|-------|--------|-------|----------|
| Recepcionista | admin@academia.com | senha123 | Acesso ao painel de gestão |
| Aluno Ativo | carlos@email.com | senha123 | Plano válido — check-in liberado |
| Aluno Vencido | marcos@email.com | senha123 | Plano expirado — check-in bloqueado |

---

## 🔌 Endpoints da API

### `POST /api/auth/login`
Autentica o usuário e retorna um token JWT.

**Body:**
```json
{
  "email": "carlos@email.com",
  "senha": "senha123"
}
```

**Resposta (200):**
```json
{
  "token": "eyJhbGci...",
  "usuario": { "id": 2, "nome": "Carlos Silva", "papel": "aluno" }
}
```

---

### `POST /api/checkin` 🔒 (apenas alunos)
Registra o check-in do aluno autenticado.

**Header:** `Authorization: Bearer <token>`

| Código | Situação |
|--------|----------|
| 201 | Check-in realizado com sucesso |
| 403 | Plano vencido ou inativo |
| 409 | Check-in já realizado hoje |

---

### `GET /api/checkin` 🔒 (apenas recepcionistas)
Lista os 50 check-ins mais recentes com dados do aluno.

**Header:** `Authorization: Bearer <token>`

---

## 🔒 Decisões de Segurança

| Mecanismo | Por quê |
|-----------|---------|
| `bcrypt` para senhas | Nunca armazena senha em texto puro |
| Mensagem genérica no login | Evita enumeração de e-mails cadastrados |
| SQL parametrizado (`?`) | Previne SQL Injection |
| JWT com expiração | Sessão com tempo limite |
| `helmet` | Adiciona headers HTTP de segurança |
| `express-rate-limit` | Protege contra força bruta |
| `UNIQUE(usuario_id, data_checkin)` | Defesa contra race condition no check-in |
| `CHECK(papel IN (...))` | Impede inserção de papéis arbitrários no banco |
| `.env` no `.gitignore` | Segredos nunca vão para o repositório |

---

## 🛠️ Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia o servidor em produção |
| `npm run dev` | Inicia com nodemon (reinicia ao salvar) |
| `npm run seed` | Recria o banco e insere dados de teste |

---

## 📦 Dependências Principais

| Pacote | Uso |
|--------|-----|
| `express` | Framework web |
| `better-sqlite3` | Banco de dados SQLite síncrono |
| `bcrypt` | Hash de senhas |
| `jsonwebtoken` | Geração e verificação de JWT |
| `helmet` | Headers de segurança HTTP |
| `express-rate-limit` | Limitação de requisições |
| `cors` | Controle de origens permitidas |
| `dotenv` | Carregamento de variáveis de ambiente |
