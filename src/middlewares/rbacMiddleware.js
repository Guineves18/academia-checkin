function autorizar(...papeis) {
    return (req, res, next) => {
        if (!papeis.includes(req.usuario.papel)) {
            return res.status(403).json({ error: 'Acesso negado: permissão insuficiente.' });
        }
        next();
    };
}

module.exports = { autorizar };