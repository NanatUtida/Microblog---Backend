const { MongoClient } = require('mongodb');

const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const NOME_BANCO = 'microblog';

let client = null;
let db = null;

async function conectar() {
  if (db) {
    return db;
  }

  client = new MongoClient(URI);
  await client.connect();
  db = client.db(NOME_BANCO);
  return db;
}

async function desconectar() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = { conectar, desconectar };
