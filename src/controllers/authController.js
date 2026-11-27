const { conectar } = require('../database');
const Usuario = require('../models/Usuario');
const { responderErro } = require('../utils/http');

async function login(req, res) {
  try {
    const db = await conectar();
    const { email, senha } = req.body;

    const usuario = await Usuario.autenticar(db, email, senha);

    req.session.usuarioId = usuario._id.toString();

    res.json({
      mensagem: 'Login realizado com sucesso',
      usuario: Usuario.semSenha(usuario),
    });
  } catch (erro) {
    responderErro(res, erro);
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.json({ mensagem: 'Logout realizado com sucesso' });
  });
}

async function me(req, res) {
  try {
    if (!req.session.usuarioId) {
      return res.status(401).json({ erro: 'Nenhum usuário autenticado nesta sessão' });
    }

    const db = await conectar();
    const usuario = await Usuario.buscarPorId(db, req.session.usuarioId);

    res.json({ usuario: Usuario.semSenha(usuario) });
  } catch (erro) {
    responderErro(res, erro);
  }
}

module.exports = { login, logout, me };
