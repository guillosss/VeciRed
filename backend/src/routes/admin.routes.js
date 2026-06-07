const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const categoriaModel = require('../models/categoria.model');
const { verificarToken, soloRol } = require('../middleware/auth.middleware');

// Ruta pública para listar categorías (no requiere auth)
router.get('/categorias/publico', async (req, res) => {
  try {
    const cats = await categoriaModel.getAll();
    res.json(cats);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Todas las rutas de admin requieren token y rol administrador
router.use(verificarToken, soloRol('administrador'));

router.get('/usuarios', adminController.getUsuarios);
router.patch('/usuarios/:id/suspender', adminController.suspenderUsuario);
router.get('/calificaciones', adminController.getCalificaciones);
router.patch('/calificaciones/:id/moderar', adminController.moderarCalificacion);
router.get('/categorias', adminController.getCategorias);
router.post('/categorias', adminController.crearCategoria);
router.delete('/categorias/:id', adminController.eliminarCategoria);

module.exports = router;