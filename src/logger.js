const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
const logFile = path.join(logDir, 'errors.log');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function formatarData(data) {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  const hora = String(data.getHours()).padStart(2, '0');
  const minuto = String(data.getMinutes()).padStart(2, '0');
  const segundo = String(data.getSeconds()).padStart(2, '0');
  return `${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo}`;
}

function registrarErro(operacao, erro) {
  const dataFormatada = formatarData(new Date());
  const linha =
    `[${dataFormatada}]\n` +
    `ERRO: Falha ao ${operacao}\n` +
    `MENSAGEM: ${erro.message}\n\n`;

  fs.appendFileSync(logFile, linha, 'utf8');
}

module.exports = { registrarErro };
