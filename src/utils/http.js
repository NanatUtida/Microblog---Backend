function responderErro(res, erro) {
  let status = 400;

  if (/não encontrad/i.test(erro.message)) {
    status = 404;
  } else if (/incorretos/i.test(erro.message)) {
    status = 401;
  }

  res.status(status).json({ erro: erro.message });
}

module.exports = { responderErro };
