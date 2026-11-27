const express = require('express');
const postagemController = require('../controllers/postagemController');
const { exigirLogin } = require('../middlewares/autenticacao');

const router = express.Router();

router.get('/', postagemController.listar);
router.get('/:id', postagemController.buscarPorId);
router.post('/', exigirLogin, postagemController.criar);
router.post('/atualizar', exigirLogin, postagemController.atualizar);
router.post('/excluir', exigirLogin, postagemController.excluir);

module.exports = router;
