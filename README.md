# Lana's Blog

Projeto 1 da disciplina de Programação Web Back-End.

## Temática escolhida

Microblogging — **Lana's Blog** é uma aplicação para cadastro de usuários, criação e busca de postagens, e publicação de comentários, inspirada em plataformas de microblogging.

## Integrantes da equipe

- Lara Englerth de Camargo
- Nathaniel Pereira Utida

## Descrição da aplicação

**Lana's Blog** é uma aplicação de linha de comando (console) em Node.js que permite cadastrar usuários, criar e consultar postagens, buscar postagens por texto, comentar em postagens, além de atualizar e excluir os registros. Toda a persistência dos dados é feita em um banco de dados MongoDB, utilizando o MongoDB Driver nativo para Node.js (sem uso de ORMs como Mongoose).

## Entidades / Classes implementadas

- **Usuario** (`src/Usuario.js`): representa os usuários cadastrados na plataforma. Campos: `nome` (obrigatório), `email` (obrigatório), `dataCriacao`.
- **Postagem** (`src/Postagem.js`): representa as postagens publicadas por um usuário. Campos: `usuarioId` (obrigatório, referencia um `Usuario`), `texto` (obrigatório), `dataCriacao`.
- **Comentario** (`src/Comentario.js`): representa os comentários feitos em uma postagem. Campos: `postagemId` (obrigatório, referencia uma `Postagem`), `usuarioId` (obrigatório, referencia um `Usuario`), `texto` (obrigatório), `dataCriacao`.

Cada classe concentra os métodos de inserção, consulta, atualização e exclusão (CRUD) da sua respectiva coleção no MongoDB.

Classes de apoio:
- **database.js**: responsável por abrir e encerrar a conexão com o MongoDB.
- **logger.js**: responsável por registrar erros e exceções da aplicação em `logs/errors.log`.

## Principais funcionalidades

- Cadastro, listagem, busca por ID, atualização e exclusão de usuários;
- Criação, listagem, busca por ID, busca por texto, atualização e exclusão de postagens;
- Criação, listagem (por postagem), atualização e exclusão de comentários;
- Validação dos campos obrigatórios de cada entidade;
- Tratamento de exceções (conexão com o banco, registros inexistentes, dados inválidos, etc.);
- Registro de erros em arquivo de log (`logs/errors.log`).

## Requisitos necessários para execução

- [Node.js](https://nodejs.org/) instalado (versão 18 ou superior recomendada);
- [MongoDB](https://www.mongodb.com/try/download/community) instalado e em execução localmente (padrão: `mongodb://127.0.0.1:27017`).

## Instalação das dependências

Na raiz do projeto, execute:

```bash
npm install
```

## Configuração do MongoDB

Por padrão, a aplicação se conecta ao MongoDB local na URI `mongodb://127.0.0.1:27017`, utilizando o banco de dados `microblog` (criado automaticamente ao inserir o primeiro registro).

Caso seja necessário utilizar outra URI (por exemplo, um MongoDB em outra porta ou com autenticação), defina a variável de ambiente `MONGODB_URI` antes de iniciar a aplicação:

```bash
# Windows (PowerShell)
$env:MONGODB_URI = "mongodb://127.0.0.1:27017"

# Linux / macOS
export MONGODB_URI="mongodb://127.0.0.1:27017"
```

## Execução do projeto

Com o MongoDB em execução, inicie a aplicação com:

```bash
npm start
```

O menu interativo do **Lana's Blog** será exibido no terminal, permitindo navegar entre as opções de usuários, postagens e comentários.

## Estrutura do projeto

```text
microblog-backend/
│
├── src/
│   ├── Usuario.js
│   ├── Postagem.js
│   ├── Comentario.js
│   ├── database.js
│   └── logger.js
│
├── logs/
│   └── errors.log
│
├── index.js
├── package.json
└── README.md
```
