const readline = require('readline');

const { conectar, desconectar } = require('./src/database');
const { registrarErro } = require('./src/logger');
const Usuario = require('./src/Usuario');
const Postagem = require('./src/Postagem');
const Comentario = require('./src/Comentario');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function perguntar(pergunta) {
  return new Promise((resolve) => rl.question(pergunta, resolve));
}

function formatarUsuario(usuario) {
  return `${usuario.nome} — ${usuario.email}`;
}

function formatarPostagem(postagem) {
  const texto = postagem.texto.length > 60 ? `${postagem.texto.slice(0, 60)}...` : postagem.texto;
  return `"${texto}" — autor: ${postagem.autorNome}`;
}

function formatarComentario(comentario) {
  return `"${comentario.texto}" — autor: ${comentario.autorNome}`;
}

function exibirLista(titulo, lista, mensagemVazia) {
  console.log(`\n--- ${titulo} ---`);
  if (lista.length === 0) {
    console.log(mensagemVazia);
    return;
  }
  lista.forEach((item) => console.log(item));
}

async function escolherItem(lista, tituloEscolha, formatarItem, mensagemVazia) {
  if (lista.length === 0) {
    console.log(`\n${mensagemVazia}`);
    return null;
  }

  console.log(`\n--- Escolha ${tituloEscolha} ---`);
  lista.forEach((item, indice) => {
    console.log(`${indice + 1} - ${formatarItem(item)}`);
  });

  const resposta = await perguntar('Digite o número da opção: ');
  const indiceEscolhido = Number(resposta) - 1;

  if (Number.isNaN(indiceEscolhido) || indiceEscolhido < 0 || indiceEscolhido >= lista.length) {
    const erro = new Error('Opção inválida');
    registrarErro(`selecionar ${tituloEscolha}`, erro);
    throw erro;
  }

  return lista[indiceEscolhido];
}

async function nomeDoAutor(db, usuarioId) {
  try {
    const autor = await Usuario.buscarPorId(db, usuarioId);
    return autor.nome;
  } catch (erro) {
    return 'Autor desconhecido';
  }
}

async function anexarAutorPostagens(db, postagens) {
  const resultado = [];
  for (const postagem of postagens) {
    const autorNome = await nomeDoAutor(db, postagem.usuarioId);
    resultado.push({ ...postagem, autorNome });
  }
  return resultado;
}

async function anexarAutorComentarios(db, comentarios) {
  const resultado = [];
  for (const comentario of comentarios) {
    const autorNome = await nomeDoAutor(db, comentario.usuarioId);
    resultado.push({ ...comentario, autorNome });
  }
  return resultado;
}

async function menuUsuarios(db) {
  let voltar = false;

  while (!voltar) {
    console.log('\n===== USUÁRIOS =====');
    console.log('1 - Cadastrar usuário');
    console.log('2 - Listar usuários');
    console.log('3 - Buscar usuário');
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
          exibirLista('Usuários', usuarios, 'Nenhum usuário encontrado.');
          break;
        }
        case '3': {
          const usuarios = await Usuario.buscarTodos(db);
          const usuarioEscolhido = await escolherItem(usuarios, 'o usuário', formatarUsuario, 'Nenhum usuário encontrado.');
          if (usuarioEscolhido) {
            const usuario = await Usuario.buscarPorId(db, usuarioEscolhido._id.toString());
            console.log(usuario);
          }
          break;
        }
        case '4': {
          const usuarios = await Usuario.buscarTodos(db);
          const usuarioEscolhido = await escolherItem(usuarios, 'o usuário', formatarUsuario, 'Nenhum usuário encontrado.');
          if (usuarioEscolhido) {
            const nome = await perguntar('Novo nome (deixe vazio para não alterar): ');
            const email = await perguntar('Novo email (deixe vazio para não alterar): ');

            const dados = {};
            if (nome) dados.nome = nome;
            if (email) dados.email = email;

            await Usuario.atualizar(db, usuarioEscolhido._id.toString(), dados);
            console.log('Usuário atualizado com sucesso!');
          }
          break;
        }
        case '5': {
          const usuarios = await Usuario.buscarTodos(db);
          const usuarioEscolhido = await escolherItem(usuarios, 'o usuário', formatarUsuario, 'Nenhum usuário encontrado.');
          if (usuarioEscolhido) {
            await Usuario.excluir(db, usuarioEscolhido._id.toString());
            console.log('Usuário excluído com sucesso!');
          }
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
    console.log('3 - Visualizar postagem');
    console.log('4 - Buscar postagens por texto');
    console.log('5 - Atualizar postagem');
    console.log('6 - Excluir postagem');
    console.log('0 - Voltar');

    const opcao = await perguntar('Escolha uma opção: ');

    try {
      switch (opcao.trim()) {
        case '1': {
          const usuarios = await Usuario.buscarTodos(db);
          const autor = await escolherItem(usuarios, 'o autor da postagem', formatarUsuario, 'Nenhum usuário encontrado.');
          if (autor) {
            const texto = await perguntar('Texto da postagem: ');
            const id = await Postagem.inserir(db, autor._id.toString(), texto);
            console.log(`Postagem criada com sucesso! ID: ${id}`);
          }
          break;
        }
        case '2': {
          const postagens = await Postagem.buscarTodos(db);
          const postagensComAutor = await anexarAutorPostagens(db, postagens);
          exibirLista('Postagens', postagensComAutor, 'Nenhuma postagem encontrada.');
          break;
        }
        case '3': {
          const postagens = await Postagem.buscarTodos(db);
          const postagensComAutor = await anexarAutorPostagens(db, postagens);
          const postagemEscolhida = await escolherItem(postagensComAutor, 'a postagem', formatarPostagem, 'Nenhuma postagem encontrada.');
          if (postagemEscolhida) {
            const postagem = await Postagem.buscarPorId(db, postagemEscolhida._id.toString());
            console.log({ ...postagem, autorNome: postagemEscolhida.autorNome });
          }
          break;
        }
        case '4': {
          const termo = await perguntar('Termo de busca: ');
          const postagens = await Postagem.buscarPorTexto(db, termo);
          const postagensComAutor = await anexarAutorPostagens(db, postagens);
          exibirLista('Resultado da busca', postagensComAutor, 'Nenhuma postagem encontrada.');
          break;
        }
        case '5': {
          const postagens = await Postagem.buscarTodos(db);
          const postagensComAutor = await anexarAutorPostagens(db, postagens);
          const postagemEscolhida = await escolherItem(postagensComAutor, 'a postagem', formatarPostagem, 'Nenhuma postagem encontrada.');
          if (postagemEscolhida) {
            const texto = await perguntar('Novo texto: ');
            await Postagem.atualizar(db, postagemEscolhida._id.toString(), { texto });
            console.log('Postagem atualizada com sucesso!');
          }
          break;
        }
        case '6': {
          const postagens = await Postagem.buscarTodos(db);
          const postagensComAutor = await anexarAutorPostagens(db, postagens);
          const postagemEscolhida = await escolherItem(postagensComAutor, 'a postagem', formatarPostagem, 'Nenhuma postagem encontrada.');
          if (postagemEscolhida) {
            await Postagem.excluir(db, postagemEscolhida._id.toString());
            console.log('Postagem excluída com sucesso!');
          }
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
          const postagens = await Postagem.buscarTodos(db);
          const postagensComAutor = await anexarAutorPostagens(db, postagens);
          const postagem = await escolherItem(postagensComAutor, 'a postagem', formatarPostagem, 'Nenhuma postagem encontrada.');
          if (!postagem) break;

          const usuarios = await Usuario.buscarTodos(db);
          const autor = await escolherItem(usuarios, 'o autor do comentário', formatarUsuario, 'Nenhum usuário encontrado.');
          if (!autor) break;

          const texto = await perguntar('Texto do comentário: ');
          const id = await Comentario.inserir(db, postagem._id.toString(), autor._id.toString(), texto);
          console.log(`Comentário criado com sucesso! ID: ${id}`);
          break;
        }
        case '2': {
          const postagens = await Postagem.buscarTodos(db);
          const postagensComAutor = await anexarAutorPostagens(db, postagens);
          const postagem = await escolherItem(postagensComAutor, 'a postagem', formatarPostagem, 'Nenhuma postagem encontrada.');
          if (!postagem) break;

          const comentarios = await Comentario.buscarPorPostagem(db, postagem._id.toString());
          const comentariosComAutor = await anexarAutorComentarios(db, comentarios);

          console.log('\nPostagem:');
          console.log(postagem);
          exibirLista('Comentários', comentariosComAutor, 'Nenhum comentário encontrado.');
          break;
        }
        case '3': {
          const postagens = await Postagem.buscarTodos(db);
          const postagensComAutor = await anexarAutorPostagens(db, postagens);
          const postagem = await escolherItem(postagensComAutor, 'a postagem', formatarPostagem, 'Nenhuma postagem encontrada.');
          if (!postagem) break;

          const comentarios = await Comentario.buscarPorPostagem(db, postagem._id.toString());
          const comentariosComAutor = await anexarAutorComentarios(db, comentarios);
          const comentario = await escolherItem(comentariosComAutor, 'o comentário', formatarComentario, 'Nenhum comentário encontrado.');
          if (!comentario) break;

          const texto = await perguntar('Novo texto: ');
          await Comentario.atualizar(db, comentario._id.toString(), { texto });
          console.log('Comentário atualizado com sucesso!');
          break;
        }
        case '4': {
          const postagens = await Postagem.buscarTodos(db);
          const postagensComAutor = await anexarAutorPostagens(db, postagens);
          const postagem = await escolherItem(postagensComAutor, 'a postagem', formatarPostagem, 'Nenhuma postagem encontrada.');
          if (!postagem) break;

          const comentarios = await Comentario.buscarPorPostagem(db, postagem._id.toString());
          const comentariosComAutor = await anexarAutorComentarios(db, comentarios);
          const comentario = await escolherItem(comentariosComAutor, 'o comentário', formatarComentario, 'Nenhum comentário encontrado.');
          if (!comentario) break;

          await Comentario.excluir(db, comentario._id.toString());
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
    console.log("\n===== LANA'S BLOG - MENU PRINCIPAL =====");
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
  let db;

  try {
    db = await conectar();
  } catch (erro) {
    registrarErro('conectar ao MongoDB', erro);
    console.log('Não foi possível conectar ao MongoDB. Verifique se o serviço está em execução.');
    console.log(`Detalhes: ${erro.message}`);
    rl.close();
    return;
  }

  console.log('Conectado ao MongoDB com sucesso!');
  console.log("\n*** Bem-vindo ao Lana's Blog! ***");

  try {
    await menuPrincipal(db);
  } catch (erro) {
    registrarErro('executar o menu principal', erro);
    console.log(`Erro inesperado: ${erro.message}`);
  } finally {
    rl.close();
    await desconectar();
  }
}

iniciar();
