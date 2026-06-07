const perfilModel = require('../models/perfil.model');
const calificacionModel = require('../models/calificacion.model');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getMiPerfil = async (req, res) => {
  try {
    const perfil = await perfilModel.getByUsuario(req.usuario.id);
    if (!perfil) return res.status(404).json({ error: 'Perfil no encontrado' });
    const categorias = await perfilModel.getCategorias(perfil.id_perfil);
    const zonas = await perfilModel.getZonas(perfil.id_perfil);
    const fotos = await perfilModel.getFotos(perfil.id_perfil);
    res.json({ ...perfil, categorias, zonas, fotos });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const crearPerfil = async (req, res) => {
  try {
    const { descripcion, telefono, whatsapp, categorias, zonas } = req.body;
    const existente = await perfilModel.getByUsuario(req.usuario.id);
    if (existente) return res.status(400).json({ error: 'Ya tienes un perfil creado' });
    const perfil = await perfilModel.crear(req.usuario.id, descripcion, telefono, whatsapp);
    if (categorias?.length) await perfilModel.setCategorias(perfil.id_perfil, categorias);
    if (zonas?.length) await perfilModel.setZonas(perfil.id_perfil, zonas);
    res.status(201).json(perfil);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const actualizarPerfil = async (req, res) => {
  try {
    const { descripcion, telefono, whatsapp, categorias, zonas } = req.body;
    let existente = await perfilModel.getByUsuario(req.usuario.id);
    if (!existente) {
      existente = await perfilModel.crear(req.usuario.id, descripcion, telefono, whatsapp);
    } else {
      await perfilModel.actualizar(existente.id_perfil, descripcion, telefono, whatsapp);
    }
    if (categorias) await perfilModel.setCategorias(existente.id_perfil, categorias);
    if (zonas) await perfilModel.setZonas(existente.id_perfil, zonas);
    res.json({ mensaje: 'Perfil actualizado correctamente' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const subirFoto = async (req, res) => {
  try {
    const { imagen_base64 } = req.body;
    const existente = await perfilModel.getByUsuario(req.usuario.id);
    if (!existente) return res.status(404).json({ error: 'Perfil no encontrado' });
    const resultado = await cloudinary.uploader.upload(imagen_base64, {
      folder: 'vecired/fotos',
    });
    const foto = await perfilModel.agregarFoto(existente.id_perfil, resultado.secure_url);
    res.status(201).json(foto);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const buscar = async (req, res) => {
  try {
    const { categoria, zona } = req.query;
    const resultados = await perfilModel.buscar(
      categoria ? `%${categoria}%` : null,
      zona || null
    );
    res.json(resultados);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getPerfilPublico = async (req, res) => {
  try {
    const perfil = await perfilModel.getPerfilCompleto(req.params.id);
    if (!perfil) return res.status(404).json({ error: 'Perfil no encontrado' });
    res.json(perfil);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const calificar = async (req, res) => {
  try {
    const { puntuacion, comentario } = req.body;
    const id_perfil = req.params.id;
    const id_vecino = req.usuario.id;
    if (puntuacion < 1 || puntuacion > 5) {
      return res.status(400).json({ error: 'Puntuación debe ser entre 1 y 5' });
    }
    const yaCalificó = await calificacionModel.yaCalificó(id_vecino, id_perfil);
    if (yaCalificó) {
      return res.status(400).json({ error: 'Ya calificaste a este prestador' });
    }
    const cal = await calificacionModel.crear(id_vecino, id_perfil, puntuacion, comentario);
    res.status(201).json(cal);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = {
  getMiPerfil, crearPerfil, actualizarPerfil,
  subirFoto, buscar, getPerfilPublico, calificar
};