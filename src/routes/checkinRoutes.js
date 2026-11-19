const express = require('express');
const router = express.Router();
const checkinService = require('../services/checkinService');
const { autenticar } = require('../middlewares/authMiddleware');
const { autorizar } = require('../middlewares/rbacMiddleware');

// POST /api/checkin  — somente alunos autenticados
router.post('/', autenticar, autorizar('aluno'), (req, res) => {
    try {
        const resultado = checkinService.realizarCheckin(req.usuario.id);
        return res.status(201).json(resultado);
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
});

// GET /api/checkin  — somente recepcionistas
router.get('/', autenticar, autorizar('recepcionista'), (req, res) => {
    try {
        const checkins = checkinService.listarCheckins();
        return res.status(200).json(checkins);
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
});

module.exports = router;