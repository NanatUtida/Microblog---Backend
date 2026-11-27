const { registrarErro } = require('../logger');

function exigirLogin(req, res, next) {
  if (!req.session || !req.session.usuarioId) {
    registrarErro(`acessar ${req.method} ${req.originalUrl}`, new Error('Tentativa de acesso sem autenticação'));
    return res.status(401).json({ erro: 'É necessário estar logado para realizar esta operação' });
  }

  next();
}

module.exports = { exigirLogin };
