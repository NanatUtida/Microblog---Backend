const { ObjectId } = require('mongodb');
const { registrarErro } = require('./logger');
const Postagem = require('./Postagem');

const COLECAO = 'usuarios';
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class Usuario {
  constructor(nome, email) {
    this.nome = nome;
    this.email = email;
    this.dataCriacao = new Date();
  }

  validar() {
    if (!this.nome || !this.email) {
      throw new Error('Os campos "nome" e "email" são obrigatórios');
    }

    if (!REGEX_EMAIL.test(this.email)) {
      throw new Error('O campo "email" deve conter um email válido (ex: nome@dominio.com)');
    }
  }

  static async inserir(db, nome, email) {
    try {
      const usuario = new Usuario(nome, email);
      usuario.validar();

      const emailExistente = await db.collection(COLECAO).findOne({ email: usuario.email });
      if (emailExistente) {
        throw new Error('Já existe um usuário cadastrado com esse email');
      }

      const resultado = await db.collection(COLECAO).insertOne(usuario);
      return resultado.insertedId;
    } catch (erro) {
      registrarErro('inserir usuário', erro);
      throw erro;
    }
  }

  static async buscarTodos(db) {
    try {
      return await db.collection(COLECAO).find().toArray();
    } catch (erro) {
      registrarErro('consultar usuários', erro);
      throw erro;
    }
  }

  static async buscarPorId(db, id) {
    try {
      const usuario = await db.collection(COLECAO).findOne({ _id: new ObjectId(id) });
      if (!usuario) {
        throw new Error('Usuário não encontrado');
      }
      return usuario;
    } catch (erro) {
      registrarErro('consultar usuário', erro);
      throw erro;
    }
  }

  static async atualizar(db, id, dadosAtualizados) {
    try {
      if (!dadosAtualizados.nome && !dadosAtualizados.email) {
        throw new Error('Informe ao menos um campo para atualização ("nome" ou "email")');
      }

      if (dadosAtualizados.email) {
        if (!REGEX_EMAIL.test(dadosAtualizados.email)) {
          throw new Error('O campo "email" deve conter um email válido (ex: nome@dominio.com)');
        }

        const emailExistente = await db.collection(COLECAO).findOne({
          email: dadosAtualizados.email,
          _id: { $ne: new ObjectId(id) },
        });
        if (emailExistente) {
          throw new Error('Já existe um usuário cadastrado com esse email');
        }
      }

      const resultado = await db.collection(COLECAO).updateOne(
        { _id: new ObjectId(id) },
        { $set: dadosAtualizados }
      );

      if (resultado.matchedCount === 0) {
        throw new Error('Usuário não encontrado');
      }

      return resultado;
    } catch (erro) {
      registrarErro('atualizar usuário', erro);
      throw erro;
    }
  }

  static async excluir(db, id) {
    try {
      const postagens = await db.collection('postagens').find({ usuarioId: id }).toArray();
      for (const postagem of postagens) {
        await Postagem.excluir(db, postagem._id.toString());
      }

      await db.collection('comentarios').deleteMany({ usuarioId: id });

      const resultado = await db.collection(COLECAO).deleteOne({ _id: new ObjectId(id) });

      if (resultado.deletedCount === 0) {
        throw new Error('Usuário não encontrado');
      }

      return resultado;
    } catch (erro) {
      registrarErro('excluir usuário', erro);
      throw erro;
    }
  }
}

module.exports = Usuario;
