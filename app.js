const express = require('express');
const session = require('express-session');

const { conectar } = require('./src/database');
const { registrarErro } = require('./src/logger');

const authRoutes = require('./src/routes/authRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const postagemRoutes = require('./src/routes/postagemRoutes');
const comentarioRoutes = require('./src/routes/comentarioRoutes');

const app = express();
const PORTA = process.env.PORT || 3000;

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'lanas-blog-segredo',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 },
  })
);

app.get('/', (req, res) => {
  res.json({ mensagem: "API do Lana's Blog no ar" });
});

app.use('/auth', authRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/postagens', postagemRoutes);
app.use('/comentarios', comentarioRoutes);

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

app.use((erro, req, res, next) => {
  registrarErro(`processar ${req.method} ${req.originalUrl}`, erro);
  res.status(500).json({ erro: 'Erro interno no servidor' });
});

async function iniciar() {
  try {
    await conectar();
  } catch (erro) {
    registrarErro('conectar ao MongoDB', erro);
    console.log('Não foi possível conectar ao MongoDB. Verifique se o serviço está em execução.');
    console.log(`Detalhes: ${erro.message}`);
    return;
  }

  app.listen(PORTA, () => {
    console.log(`Conectado ao MongoDB com sucesso!`);
    console.log(`Lana's Blog rodando em http://localhost:${PORTA}`);
  });
}

iniciar();

module.exports = app;
