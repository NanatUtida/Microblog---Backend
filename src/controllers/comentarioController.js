const { conectar } = require('../database');
const Comentario = require('../models/Comentario');
const { responderErro } = require('../utils/http');

async function criar(req, res) {
  try {
    const db = await conectar();
    const { postagemId, texto } = req.body;

    const id = await Comentario.inserir(db, postagemId, req.session.usuarioId, texto);

    res.status(201).json({ mensagem: 'Comentário criado com sucesso', id });
  } catch (erro) {
    responderErro(res, erro);
  }
}

async function listarPorPostagem(req, res) {
  try {
    const { postagemId } = req.query;

    if (!postagemId) {
      return res.status(400).json({ erro: 'Informe o parâmetro "postagemId" na busca' });
    }

    const db = await conectar();
    const comentarios = await Comentario.buscarPorPostagem(db, postagemId);

    res.json(comentarios);
  } catch (erro) {
    responderErro(res, erro);
  }
}

async function atualizar(req, res) {
  try {
    const db = await conectar();
    const { id, texto } = req.body;

    const comentario = await Comentario.buscarPorId(db, id);
    if (comentario.usuarioId !== req.session.usuarioId) {
      return res.status(403).json({ erro: 'Você só pode atualizar os seus próprios comentários' });
    }

    await Comentario.atualizar(db, id, { texto });

    res.json({ mensagem: 'Comentário atualizado com sucesso' });
  } catch (erro) {
    responderErro(res, erro);
  }
}

async function excluir(req, res) {
  try {
    const db = await conectar();
    const { id } = req.body;

    const comentario = await Comentario.buscarPorId(db, id);
    if (comentario.usuarioId !== req.session.usuarioId) {
      return res.status(403).json({ erro: 'Você só pode excluir os seus próprios comentários' });
    }

    await Comentario.excluir(db, id);

    res.json({ mensagem: 'Comentário excluído com sucesso' });
  } catch (erro) {
    responderErro(res, erro);
  }
}

module.exports = { criar, listarPorPostagem, atualizar, excluir };
