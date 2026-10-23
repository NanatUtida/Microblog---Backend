const readline = require('readline');

const { conectar, desconectar } = require('./src/database');
const Usuario = require('./src/Usuario');
const Postagem = require('./src/Postagem');
const Comentario = require('./src/Comentario');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function perguntar(pergunta) {
  return new Promise((resolve) => rl.question(pergunta, resolve));
}

function exibirLista(titulo, lista) {
  console.log(`\n--- ${titulo} ---`);
  if (lista.length === 0) {
    console.log('Nenhum registro encontrado.');
    return;
  }
  lista.forEach((item) => console.log(item));
}

async function menuUsuarios(db) {
  let voltar = false;

  while (!voltar) {
    console.log('\n===== USUÁRIOS =====');
    console.log('1 - Cadastrar usuário');
    console.log('2 - Listar usuários');
    console.log('3 - Buscar usuário por ID');
    console.log('4 - Atualizar usuário');
    console.log('5 - Excluir usuário');
    console.log('0 - Voltar');

    const opcao = await perguntar('Escolha uma opção: ');

    try {
      switch (opcao.trim()) {
        case '1': {
          const nome = await perguntar('Nome: ');
          const email = await perguntar('Email: ');
          const id = await Usuario.inserir(db, nome, email);
          console.log(`Usuário cadastrado com sucesso! ID: ${id}`);
          break;
        }
        case '2': {
          const usuarios = await Usuario.buscarTodos(db);
          exibirLista('Usuários', usuarios);
          break;
        }
        case '3': {
          const id = await perguntar('ID do usuário: ');
          const usuario = await Usuario.buscarPorId(db, id);
          console.log(usuario);
          break;
        }
        case '4': {
          const id = await perguntar('ID do usuário: ');
          const nome = await perguntar('Novo nome (deixe vazio para não alterar): ');
          const email = await perguntar('Novo email (deixe vazio para não alterar): ');

          const dados = {};
          if (nome) dados.nome = nome;
          if (email) dados.email = email;

          await Usuario.atualizar(db, id, dados);
          console.log('Usuário atualizado com sucesso!');
          break;
        }
        case '5': {
          const id = await perguntar('ID do usuário: ');
          await Usuario.excluir(db, id);
          console.log('Usuário excluído com sucesso!');
          break;
        }
        case '0':
          voltar = true;
          break;
        default:
          console.log('Opção inválida.');
      }
    } catch (erro) {
      console.log(`Erro: ${erro.message}`);
    }
  }
}

async function menuPostagens(db) {
  let voltar = false;

  while (!voltar) {
    console.log('\n===== POSTAGENS =====');
    console.log('1 - Criar postagem');
    console.log('2 - Listar postagens');
    console.log('3 - Buscar postagem por ID');
    console.log('4 - Buscar postagens por texto');
    console.log('5 - Atualizar postagem');
    console.log('6 - Excluir postagem');
    console.log('0 - Voltar');

    const opcao = await perguntar('Escolha uma opção: ');

    try {
      switch (opcao.trim()) {
        case '1': {
          const usuarioId = await perguntar('ID do usuário autor: ');
          const texto = await perguntar('Texto da postagem: ');
          const id = await Postagem.inserir(db, usuarioId, texto);
          console.log(`Postagem criada com sucesso! ID: ${id}`);
          break;
        }
        case '2': {
          const postagens = await Postagem.buscarTodos(db);
          exibirLista('Postagens', postagens);
          break;
        }
        case '3': {
          const id = await perguntar('ID da postagem: ');
          const postagem = await Postagem.buscarPorId(db, id);
          console.log(postagem);
          break;
        }
        case '4': {
          const termo = await perguntar('Termo de busca: ');
          const postagens = await Postagem.buscarPorTexto(db, termo);
          exibirLista('Resultado da busca', postagens);
          break;
        }
        case '5': {
          const id = await perguntar('ID da postagem: ');
          const texto = await perguntar('Novo texto: ');
          await Postagem.atualizar(db, id, { texto });
          console.log('Postagem atualizada com sucesso!');
          break;
        }
        case '6': {
          const id = await perguntar('ID da postagem: ');
          await Postagem.excluir(db, id);
          console.log('Postagem excluída com sucesso!');
          break;
        }
        case '0':
          voltar = true;
          break;
        default:
          console.log('Opção inválida.');
      }
    } catch (erro) {
      console.log(`Erro: ${erro.message}`);
    }
  }
}

async function menuComentarios(db) {
  let voltar = false;

  while (!voltar) {
    console.log('\n===== COMENTÁRIOS =====');
    console.log('1 - Comentar em uma postagem');
    console.log('2 - Listar comentários de uma postagem');
    console.log('3 - Atualizar comentário');
    console.log('4 - Excluir comentário');
    console.log('0 - Voltar');

    const opcao = await perguntar('Escolha uma opção: ');

    try {
      switch (opcao.trim()) {
        case '1': {
          const postagemId = await perguntar('ID da postagem: ');
          const usuarioId = await perguntar('ID do usuário autor: ');
          const texto = await perguntar('Texto do comentário: ');
          const id = await Comentario.inserir(db, postagemId, usuarioId, texto);
          console.log(`Comentário criado com sucesso! ID: ${id}`);
          break;
        }
        case '2': {
          const postagemId = await perguntar('ID da postagem: ');
          const comentarios = await Comentario.buscarPorPostagem(db, postagemId);
          exibirLista('Comentários', comentarios);
          break;
        }
        case '3': {
          const id = await perguntar('ID do comentário: ');
          const texto = await perguntar('Novo texto: ');
          await Comentario.atualizar(db, id, { texto });
          console.log('Comentário atualizado com sucesso!');
          break;
        }
        case '4': {
          const id = await perguntar('ID do comentário: ');
          await Comentario.excluir(db, id);
          console.log('Comentário excluído com sucesso!');
          break;
        }
        case '0':
          voltar = true;
          break;
        default:
          console.log('Opção inválida.');
      }
    } catch (erro) {
      console.log(`Erro: ${erro.message}`);
    }
  }
}

async function menuPrincipal(db) {
  let sair = false;

  while (!sair) {
    console.log('\n===== MICROBLOG - MENU PRINCIPAL =====');
    console.log('1 - Gerenciar usuários');
    console.log('2 - Gerenciar postagens');
    console.log('3 - Gerenciar comentários');
    console.log('0 - Sair');

    const opcao = await perguntar('Escolha uma opção: ');

    switch (opcao.trim()) {
      case '1':
        await menuUsuarios(db);
        break;
      case '2':
        await menuPostagens(db);
        break;
      case '3':
        await menuComentarios(db);
        break;
      case '0':
        sair = true;
        break;
      default:
        console.log('Opção inválida.');
    }
  }
}

async function iniciar() {
  try {
    const db = await conectar();
    console.log('Conectado ao MongoDB com sucesso!');

    await menuPrincipal(db);
  } catch (erro) {
    console.log('Não foi possível conectar ao MongoDB. Verifique se o serviço está em execução.');
    console.log(`Detalhes: ${erro.message}`);
  } finally {
    rl.close();
    await desconectar();
  }
}

iniciar();
