const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const checkinRoutes = require('./routes/checkinRoutes');

const app = express();

// --- MIDDLEWARES DE SEGURANÇA ---

// Helmet: adiciona headers HTTP de segurança automaticamente
app.use(helmet({
    contentSecurityPolicy: false // desabilitado para servir o front-end local
}));

// CORS: permite requisições do front-end
app.use(cors());

// Rate Limiting: máximo 100 requisições por IP a cada 15 minutos
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' }
});
app.use('/api', limiter);

// Parse de JSON no body das requisições
app.use(express.json());

// --- ARQUIVOS ESTÁTICOS (front-end) ---
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- ROTAS DA API ---
app.use('/api/auth', authRoutes);
app.use('/api/checkin', checkinRoutes);

// --- ROTA FALLBACK: qualquer URL não encontrada serve o index.html ---
// Express 5 não aceita '*' — usa regex para capturar qualquer rota
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// --- INICIALIZAÇÃO ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});