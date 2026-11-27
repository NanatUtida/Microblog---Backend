const { conectar } = require('../database');
const Usuario = require('../models/Usuario');
const { responderErro } = require('../utils/http');

async function cadastrar(req, res) {
  try {
    const db = await conectar();
    const { nome, email, senha } = req.body;

    const id = await Usuario.inserir(db, nome, email, senha);

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso', id });
  } catch (erro) {
    responderErro(res, erro);
  }
}

async function listar(req, res) {
  try {
    const db = await conectar();
    const usuarios = await Usuario.buscarTodos(db);

    res.json(usuarios.map(Usuario.semSenha));
  } catch (erro) {
    responderErro(res, erro);
  }
}

async function buscarPorId(req, res) {
  try {
    const db = await conectar();
    const usuario = await Usuario.buscarPorId(db, req.params.id);

    res.json(Usuario.semSenha(usuario));
  } catch (erro) {
    responderErro(res, erro);
  }
}

async function atualizar(req, res) {
  try {
    const { id, nome, email } = req.body;

    if (id !== req.session.usuarioId) {
      return res.status(403).json({ erro: 'Você só pode atualizar o seu próprio usuário' });
    }

    const db = await conectar();
    await Usuario.atualizar(db, id, { nome, email });

    res.json({ mensagem: 'Usuário atualizado com sucesso' });
  } catch (erro) {
    responderErro(res, erro);
  }
}

async function excluir(req, res) {
  try {
    const { id } = req.body;

    if (id !== req.session.usuarioId) {
      return res.status(403).json({ erro: 'Você só pode excluir o seu próprio usuário' });
    }

    const db = await conectar();
    await Usuario.excluir(db, id);

    req.session.destroy(() => {
      res.json({ mensagem: 'Usuário excluído com sucesso' });
    });
  } catch (erro) {
    responderErro(res, erro);
  }
}

module.exports = { cadastrar, listar, buscarPorId, atualizar, excluir };
