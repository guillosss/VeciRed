const calificacionModel = require('../models/calificacion.model');
const categoriaModel = require('../models/categoria.model');
const usuarioModel = require('../models/usuario.model');

const getUsuarios = async (req, res) => {
  try {
    const usuarios = await usuarioModel.getAll();
    res.json(usuarios);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const suspenderUsuario = async (req, res) => {
  try {
    const usuario = await usuarioModel.toggleSuspendido(req.params.id);
    res.json(usuario);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getCalificaciones = async (req, res) => {
  try {
    const cals = await calificacionModel.getAll();
    res.json(cals);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const moderarCalificacion = async (req, res) => {
  try {
    const cal = await calificacionModel.toggleVisible(req.params.id);
    res.json(cal);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getCategorias = async (req, res) => {
  try {
    const cats = await categoriaModel.getAll();
    res.json(cats);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const crearCategoria = async (req, res) => {
  try {
    const cat = await categoriaModel.crear(req.body.nombre);
    res.status(201).json(cat);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const eliminarCategoria = async (req, res) => {
  try {
    await categoriaModel.eliminar(req.params.id);
    res.json({ mensaje: 'Categoría eliminada' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = {
  getUsuarios, suspenderUsuario,
  getCalificaciones, moderarCalificacion,
  getCategorias, crearCategoria, eliminarCategoria
};