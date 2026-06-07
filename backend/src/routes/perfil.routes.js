const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfil.controller');
const { verificarToken, soloRol } = require('../middleware/auth.middleware');

router.get('/buscar', perfilController.buscar);
router.get('/mio', verificarToken, soloRol('prestador'), perfilController.getMiPerfil);
router.post('/', verificarToken, soloRol('prestador'), perfilController.crearPerfil);
router.put('/', verificarToken, soloRol('prestador'), perfilController.actualizarPerfil);
router.post('/foto', verificarToken, soloRol('prestador'), perfilController.subirFoto);
router.get('/:id', perfilController.getPerfilPublico);
router.post('/:id/calificar', verificarToken, soloRol('vecino'), perfilController.calificar);

module.exports = router;