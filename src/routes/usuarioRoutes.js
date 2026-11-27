const express = require('express');
const usuarioController = require('../controllers/usuarioController');
const { exigirLogin } = require('../middlewares/autenticacao');

const router = express.Router();

router.get('/', usuarioController.listar);
router.get('/:id', usuarioController.buscarPorId);
router.post('/', usuarioController.cadastrar);
router.post('/atualizar', exigirLogin, usuarioController.atualizar);
router.post('/excluir', exigirLogin, usuarioController.excluir);

module.exports = router;
