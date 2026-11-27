const { paraObjectId } = require('../utils/objectId');
const crypto = require('crypto');
const { registrarErro } = require('../logger');
const Postagem = require('./Postagem');

const COLECAO = 'usuarios';
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function gerarHashSenha(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(senha, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function senhaCorresponde(senha, senhaHashArmazenada) {
  const [salt, hashArmazenado] = senhaHashArmazenada.split(':');
  const hashCalculado = crypto.scryptSync(senha, salt, 64);
  const bufferArmazenado = Buffer.from(hashArmazenado, 'hex');

  return (
    hashCalculado.length === bufferArmazenado.length &&
    crypto.timingSafeEqual(hashCalculado, bufferArmazenado)
  );
}

class Usuario {
  constructor(nome, email, senhaHash) {
    this.nome = nome;
    this.email = email;
    this.senhaHash = senhaHash;
    this.dataCriacao = new Date();
  }

  validar() {
    if (!this.nome || !this.email || !this.senhaHash) {
      throw new Error('Os campos "nome", "email" e "senha" são obrigatórios');
    }

    if (!REGEX_EMAIL.test(this.email)) {
      throw new Error('O campo "email" deve conter um email válido (ex: nome@dominio.com)');
    }
  }

  static semSenha(usuario) {
    const { senhaHash, ...dadosPublicos } = usuario;
    return dadosPublicos;
  }

  static async inserir(db, nome, email, senha) {
    try {
      if (!senha || senha.length < 4) {
        throw new Error('O campo "senha" é obrigatório e deve ter ao menos 4 caracteres');
      }

      const usuario = new Usuario(nome, email, gerarHashSenha(senha));
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

  static async autenticar(db, email, senha) {
    try {
      if (!email || !senha) {
        throw new Error('Os campos "email" e "senha" são obrigatórios');
      }

      const usuario = await db.collection(COLECAO).findOne({ email });

      if (!usuario || !senhaCorresponde(senha, usuario.senhaHash)) {
        throw new Error('Email ou senha incorretos');
      }

      return usuario;
    } catch (erro) {
      registrarErro('autenticar usuário', erro);
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
      const usuario = await db.collection(COLECAO).findOne({ _id: paraObjectId(id) });
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
          _id: { $ne: paraObjectId(id) },
        });
        if (emailExistente) {
          throw new Error('Já existe um usuário cadastrado com esse email');
        }
      }

      const resultado = await db.collection(COLECAO).updateOne(
        { _id: paraObjectId(id) },
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

      const resultado = await db.collection(COLECAO).deleteOne({ _id: paraObjectId(id) });

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
