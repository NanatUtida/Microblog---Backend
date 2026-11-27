const { conectar } = require('../database');
const Postagem = require('../models/Postagem');
const { responderErro } = require('../utils/http');

async function criar(req, res) {
  try {
    const db = await conectar();
    const { texto } = req.body;

    const id = await Postagem.inserir(db, req.session.usuarioId, texto);

    res.status(201).json({ mensagem: 'Postagem criada com sucesso', id });
  } catch (erro) {
    responderErro(res, erro);
  }
}

async function listar(req, res) {
  try {
    const db = await conectar();
    const { busca } = req.query;

    const postagens = busca
      ? await Postagem.buscarPorTexto(db, busca)
      : await Postagem.buscarTodos(db);

    res.json(postagens);
  } catch (erro) {
    responderErro(res, erro);
  }
}

async function buscarPorId(req, res) {
  try {
    const db = await conectar();
    const postagem = await Postagem.buscarPorId(db, req.params.id);

    res.json(postagem);
  } catch (erro) {
    responderErro(res, erro);
  }
}

async function atualizar(req, res) {
  try {
    const db = await conectar();
    const { id, texto } = req.body;

    const postagem = await Postagem.buscarPorId(db, id);
    if (postagem.usuarioId !== req.session.usuarioId) {
      return res.status(403).json({ erro: 'Você só pode atualizar as suas próprias postagens' });
    }

    await Postagem.atualizar(db, id, { texto });

    res.json({ mensagem: 'Postagem atualizada com sucesso' });
  } catch (erro) {
    responderErro(res, erro);
  }
}

async function excluir(req, res) {
  try {
    const db = await conectar();
    const { id } = req.body;

    const postagem = await Postagem.buscarPorId(db, id);
    if (postagem.usuarioId !== req.session.usuarioId) {
      return res.status(403).json({ erro: 'Você só pode excluir as suas próprias postagens' });
    }

    await Postagem.excluir(db, id);

    res.json({ mensagem: 'Postagem excluída com sucesso' });
  } catch (erro) {
    responderErro(res, erro);
  }
}

module.exports = { criar, listar, buscarPorId, atualizar, excluir };
