const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

// POST /api/auth/login
router.post('/login', (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
        }

        const resultado = authService.login(email, senha);
        return res.status(200).json(resultado);
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
});

module.exports = router;