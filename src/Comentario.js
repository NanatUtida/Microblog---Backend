const { ObjectId } = require('mongodb');
const { registrarErro } = require('./logger');

const COLECAO = 'comentarios';

class Comentario {
  constructor(postagemId, usuarioId, texto) {
    this.postagemId = postagemId;
    this.usuarioId = usuarioId;
    this.texto = texto;
    this.dataCriacao = new Date();
  }

  validar() {
    if (!this.postagemId || !this.usuarioId || !this.texto) {
      throw new Error('Os campos "postagemId", "usuarioId" e "texto" são obrigatórios');
    }
  }

  static async inserir(db, postagemId, usuarioId, texto) {
    try {
      const postagemExiste = await db
        .collection('postagens')
        .findOne({ _id: new ObjectId(postagemId) });

      if (!postagemExiste) {
        throw new Error('Postagem informada não existe');
      }

      const comentario = new Comentario(postagemId, usuarioId, texto);
      comentario.validar();

      const resultado = await db.collection(COLECAO).insertOne(comentario);
      return resultado.insertedId;
    } catch (erro) {
      registrarErro('inserir comentário', erro);
      throw erro;
    }
  }

  static async buscarPorPostagem(db, postagemId) {
    try {
      return await db
        .collection(COLECAO)
        .find({ postagemId: postagemId })
        .sort({ dataCriacao: 1 })
        .toArray();
    } catch (erro) {
      registrarErro('consultar comentários', erro);
      throw erro;
    }
  }

  static async buscarPorId(db, id) {
    try {
      const comentario = await db.collection(COLECAO).findOne({ _id: new ObjectId(id) });
      if (!comentario) {
        throw new Error('Comentário não encontrado');
      }
      return comentario;
    } catch (erro) {
      registrarErro('consultar comentário', erro);
      throw erro;
    }
  }

  static async atualizar(db, id, dadosAtualizados) {
    try {
      if (!dadosAtualizados.texto) {
        throw new Error('Informe o campo "texto" para atualização');
      }

      const resultado = await db.collection(COLECAO).updateOne(
        { _id: new ObjectId(id) },
        { $set: dadosAtualizados }
      );

      if (resultado.matchedCount === 0) {
        throw new Error('Comentário não encontrado');
      }

      return resultado;
    } catch (erro) {
      registrarErro('atualizar comentário', erro);
      throw erro;
    }
  }

  static async excluir(db, id) {
    try {
      const resultado = await db.collection(COLECAO).deleteOne({ _id: new ObjectId(id) });

      if (resultado.deletedCount === 0) {
        throw new Error('Comentário não encontrado');
      }

      return resultado;
    } catch (erro) {
      registrarErro('excluir comentário', erro);
      throw erro;
    }
  }
}

module.exports = Comentario;
