# Lana's Blog

Projeto 2 da disciplina de Programação Web Back-End, evolução do Projeto 1, agora disponibilizado como uma API Web com Express.js.

## Temática escolhida

Microblogging - **Lana's Blog** é uma aplicação para cadastro de usuários, criação e busca de postagens, e publicação de comentários, inspirada em plataformas de microblogging.

## Integrantes da equipe

- Lara Englerth de Camargo
- Nathaniel Pereira Utida

## Descrição da aplicação

**Lana's Blog** é uma API Web construída com **Node.js + Express.js**, reaproveitando as classes e regras de negócio do Projeto 1 e integrando-as a rotas HTTP. A API segue o padrão **MVC**:

- **Model**: classes `Usuario`, `Postagem` e `Comentario` (`src/models/`), responsáveis pelas regras de negócio e pelo acesso ao MongoDB via MongoDB Driver.
- **Controller**: funções em `src/controllers/` que recebem a requisição HTTP, chamam os models e devolvem a resposta.
- **View**: como o projeto segue a abordagem de **API JSON** (sem templates HTML), a "visualização" é a própria resposta HTTP em JSON.

A autenticação é feita por **login com sessão** (`express-session`): o usuário faz login, o servidor cria uma sessão, e as rotas de escrita (criar/atualizar/excluir) exigem essa sessão ativa. Senhas são armazenadas com hash (nunca em texto puro), usando o módulo nativo `crypto` do Node.js.

## Entidades / Models implementados

- **Usuario** (`src/models/Usuario.js`): usuários da plataforma. Campos: `nome`, `email` (único, validado), `senhaHash` (nunca exposto nas respostas), `dataCriacao`.
- **Postagem** (`src/models/Postagem.js`): postagens publicadas por um usuário. Campos: `usuarioId`, `texto`, `dataCriacao`.
- **Comentario** (`src/models/Comentario.js`): comentários feitos em uma postagem. Campos: `postagemId`, `usuarioId`, `texto`, `dataCriacao`.

Excluir um usuário remove em cascata suas postagens e todos os comentários relacionados a ele. Excluir uma postagem remove em cascata os comentários dela.

## Organização dos arquivos

```text
Microblog---Backend/
│
├── src/
│   ├── models/          # Classes de entidade e acesso ao MongoDB (Model)
│   │   ├── Usuario.js
│   │   ├── Postagem.js
│   │   └── Comentario.js
│   ├── controllers/     # Processamento das requisições (Controller)
│   │   ├── authController.js
│   │   ├── usuarioController.js
│   │   ├── postagemController.js
│   │   └── comentarioController.js
│   ├── routes/          # Definição das rotas Express
│   │   ├── authRoutes.js
│   │   ├── usuarioRoutes.js
│   │   ├── postagemRoutes.js
│   │   └── comentarioRoutes.js
│   ├── middlewares/
│   │   └── autenticacao.js   # Middleware que exige login (sessão) nas rotas protegidas
│   ├── utils/
│   │   ├── http.js           # Mapeia erros para o status HTTP correto
│   │   └── objectId.js       # Valida IDs do MongoDB com mensagem amigável
│   ├── database.js       # Conexão com o MongoDB
│   └── logger.js         # Registro de erros em arquivo de log
│
├── logs/
│   └── errors.log
│
├── app.js                # Ponto de entrada: configura Express, sessão e rotas
├── package.json
└── README.md
```

## Funcionalidades implementadas

- Cadastro de usuário (com senha, armazenada com hash).
- Login com sessão, verificação de sessão (`/auth/me`) e logout.
- CRUD de postagens (criar, listar, buscar por ID, buscar por texto, atualizar, excluir).
- CRUD de comentários (criar, listar por postagem, atualizar, excluir).
- Apenas o próprio autor pode atualizar/excluir suas postagens, comentários ou seu próprio usuário.
- Validação de campos obrigatórios, formato de email, senha mínima, email duplicado e IDs inválidos.
- Tratamento de exceções (conexão com o banco, autenticação, registros inexistentes, rota inexistente, erros inesperados) sem encerrar a aplicação.
- Registro de erros relevantes em `logs/errors.log`.

## Requisitos necessários para execução

- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada).
- [MongoDB](https://www.mongodb.com/try/download/community) instalado e em execução localmente (padrão: `mongodb://127.0.0.1:27017`).
- Uma ferramenta para testar requisições HTTP, como [Postman](https://www.postman.com/downloads/).

## Dependências

Declaradas no `package.json`:

- **express** - framework Web usado para criar o servidor e as rotas.
- **express-session** - gerenciamento de sessão (login/autenticação).
- **mongodb** - MongoDB Driver nativo, usado para acessar o banco de dados.
- **nodemon** (apenas desenvolvimento) - reinicia o servidor automaticamente a cada alteração de arquivo.

## Instalação das dependências

```bash
npm install
```

## Configuração do MongoDB

Por padrão, a aplicação se conecta ao MongoDB local na URI `mongodb://127.0.0.1:27017`, utilizando o banco de dados `microblog`.

Para usar outra URI, defina a variável de ambiente `MONGODB_URI` antes de iniciar:

```bash
# Windows (PowerShell)
$env:MONGODB_URI = "mongodb://127.0.0.1:27017"

# Linux / macOS
export MONGODB_URI="mongodb://127.0.0.1:27017"
```

## Execução do projeto

Com o MongoDB em execução:

```bash
npm start
```

Ou, durante o desenvolvimento, com reinício automático a cada alteração de arquivo (via **Nodemon**):

```bash
npm run dev
```

Por padrão, o servidor roda em `http://localhost:3000` (pode ser alterado com a variável de ambiente `PORT`).

## Rotas disponíveis

| Método | Rota | Protegida? | Descrição |
|---|---|---|---|
| GET | `/` | Não | Mensagem de status da API |
| POST | `/usuarios` | Não | Cadastrar usuário - body: `{ nome, email, senha }` |
| GET | `/usuarios` | Não | Listar usuários |
| GET | `/usuarios/:id` | Não | Buscar um usuário por ID |
| POST | `/usuarios/atualizar` | Sim (só o próprio) | Atualizar usuário - body: `{ id, nome, email }` |
| POST | `/usuarios/excluir` | Sim (só o próprio) | Excluir usuário (e seus dados, em cascata) - body: `{ id }` |
| POST | `/auth/login` | Não | Login - body: `{ email, senha }` |
| POST | `/auth/logout` | Não | Encerra a sessão |
| GET | `/auth/me` | Sim | Retorna o usuário autenticado na sessão atual |
| GET | `/postagens` | Não | Listar postagens. Com `?busca=termo`, filtra por texto |
| GET | `/postagens/:id` | Não | Buscar uma postagem por ID |
| POST | `/postagens` | Sim | Criar postagem - body: `{ texto }` (o autor é o usuário logado) |
| POST | `/postagens/atualizar` | Sim (só o autor) | Atualizar postagem — body: `{ id, texto }` |
| POST | `/postagens/excluir` | Sim (só o autor) | Excluir postagem (e seus comentários, em cascata) - body: `{ id }` |
| GET | `/comentarios?postagemId=...` | Não | Listar comentários de uma postagem |
| POST | `/comentarios` | Sim | Criar comentário - body: `{ postagemId, texto }` |
| POST | `/comentarios/atualizar` | Sim (só o autor) | Atualizar comentário - body: `{ id, texto }` |
| POST | `/comentarios/excluir` | Sim (só o autor) | Excluir comentário - body: `{ id }` |

"Protegida" significa que a rota exige uma sessão de login ativa (ver seção abaixo). "Só o autor"/"só o próprio" significa que, além de estar logado, só o usuário que criou o registro pode alterá-lo ou excluí-lo - tentar fazer isso com outro usuário retorna erro `403`.

## Como testar o login e as rotas protegidas

As rotas usam **sessão baseada em cookie**. Ao testar no Postman, deixe o gerenciamento de cookies ativado (é o padrão dessas ferramentas) para que o cookie de sessão recebido no login seja reenviado automaticamente nas próximas requisições.

1. **Cadastre um usuário**:
   ```
   POST http://localhost:3000/usuarios
   Content-Type: application/json

   { "nome": "Dani", "email": "dani@example.com", "senha": "senha123" }
   ```

2. **Faça login** (isso cria a sessão):
   ```
   POST http://localhost:3000/auth/login
   Content-Type: application/json

   { "email": "dani@example.com", "senha": "senha123" }
   ```

3. **Confirme que está logado**:
   ```
   GET http://localhost:3000/auth/me
   ```

4. **Use uma rota protegida** (ex: criar postagem) - funciona porque o cookie de sessão foi enviado automaticamente:
   ```
   POST http://localhost:3000/postagens
   Content-Type: application/json

   { "texto": "Minha primeira postagem!" }
   ```

5. **Teste o bloqueio**: faça logout (`POST /auth/logout`) e repita o passo 4 - a resposta deve ser `401` com `{ "erro": "É necessário estar logado para realizar esta operação" }`.

6. **Teste a posse**: cadastre e logue com um segundo usuário, e tente atualizar/excluir a postagem criada pelo primeiro usuário - a resposta deve ser `403`.

### Testando com `curl`

```bash
# cadastro
curl -X POST http://localhost:3000/usuarios -H "Content-Type: application/json" -d "{\"nome\":\"Dani\",\"email\":\"dani@example.com\",\"senha\":\"senha123\"}"

# login (salva o cookie de sessão em cookies.txt)
curl -c cookies.txt -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d "{\"email\":\"dani@example.com\",\"senha\":\"senha123\"}"

# rota protegida, reenviando o cookie salvo
curl -b cookies.txt -X POST http://localhost:3000/postagens -H "Content-Type: application/json" -d "{\"texto\":\"Minha primeira postagem!\"}"
```

## Tratamento de exceções e logs

Erros de conexão com o MongoDB, validação, autenticação, registros não encontrados, IDs inválidos e falhas inesperadas durante uma requisição são tratados sem encerrar o servidor, e registrados em `logs/errors.log` com data, horário, operação e mensagem do erro.
