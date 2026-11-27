const express = require('express');
const comentarioController = require('../controllers/comentarioController');
const { exigirLogin } = require('../middlewares/autenticacao');

const router = express.Router();

router.get('/', comentarioController.listarPorPostagem);
router.post('/', exigirLogin, comentarioController.criar);
router.post('/atualizar', exigirLogin, comentarioController.atualizar);
router.post('/excluir', exigirLogin, comentarioController.excluir);

module.exports = router;
