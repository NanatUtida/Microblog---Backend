const { ObjectId } = require('mongodb');
const { registrarErro } = require('./logger');

const COLECAO = 'postagens';

class Postagem {
  constructor(usuarioId, texto) {
    this.usuarioId = usuarioId;
    this.texto = texto;
    this.dataCriacao = new Date();
  }

  validar() {
    if (!this.usuarioId || !this.texto) {
      throw new Error('Os campos "usuarioId" e "texto" são obrigatórios');
    }
  }

  static async inserir(db, usuarioId, texto) {
    try {
      const usuarioExiste = await db
        .collection('usuarios')
        .findOne({ _id: new ObjectId(usuarioId) });

      if (!usuarioExiste) {
        throw new Error('Usuário informado não existe');
      }

      const postagem = new Postagem(usuarioId, texto);
      postagem.validar();

      const resultado = await db.collection(COLECAO).insertOne(postagem);
      return resultado.insertedId;
    } catch (erro) {
      registrarErro('inserir postagem', erro);
      throw erro;
    }
  }

  static async buscarTodos(db) {
    try {
      return await db.collection(COLECAO).find().sort({ dataCriacao: -1 }).toArray();
    } catch (erro) {
      registrarErro('consultar postagens', erro);
      throw erro;
    }
  }

  static async buscarPorId(db, id) {
    try {
      const postagem = await db.collection(COLECAO).findOne({ _id: new ObjectId(id) });
      if (!postagem) {
        throw new Error('Postagem não encontrada');
      }
      return postagem;
    } catch (erro) {
      registrarErro('consultar postagem', erro);
      throw erro;
    }
  }

  static async buscarPorTexto(db, termo) {
    try {
      if (!termo) {
        throw new Error('Informe um termo para busca');
      }

      return await db
        .collection(COLECAO)
        .find({ texto: { $regex: termo, $options: 'i' } })
        .toArray();
    } catch (erro) {
      registrarErro('buscar postagens por texto', erro);
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
        throw new Error('Postagem não encontrada');
      }

      return resultado;
    } catch (erro) {
      registrarErro('atualizar postagem', erro);
      throw erro;
    }
  }

  static async excluir(db, id) {
    try {
      await db.collection('comentarios').deleteMany({ postagemId: id });

      const resultado = await db.collection(COLECAO).deleteOne({ _id: new ObjectId(id) });

      if (resultado.deletedCount === 0) {
        throw new Error('Postagem não encontrada');
      }

      return resultado;
    } catch (erro) {
      registrarErro('excluir postagem', erro);
      throw erro;
    }
  }
}

module.exports = Postagem;
