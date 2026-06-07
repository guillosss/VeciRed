const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuario.model');

const registro = async (req, res) => {
  try {
    const { nombre, correo, contrasena, rol } = req.body;
    const existente = await usuarioModel.findByCorreo(correo);
    if (existente) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }
    const hash = await bcrypt.hash(contrasena, 10);
    const usuario = await usuarioModel.crear(nombre, correo, hash, rol);
    res.status(201).json({ mensaje: 'Usuario creado', usuario });
  } catch (error) {
    console.error('ERROR REGISTRO:', error.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    const usuario = await usuarioModel.findByCorreo(correo);
    if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });

    const valida = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!valida) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: usuario.id_usuario, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({
      token,
      usuario: { id: usuario.id_usuario, nombre: usuario.nombre, rol: usuario.rol }
    });
  } catch (error) {
    console.error('ERROR LOGIN:', error.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

module.exports = { registro, login };