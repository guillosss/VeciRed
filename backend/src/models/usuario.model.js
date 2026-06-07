const pool = require('../db');

const findByCorreo = async (correo) => {
  const result = await pool.query(
    'SELECT * FROM usuario WHERE correo = $1',
    [correo]
  );
  return result.rows[0];
};

const crear = async (nombre, correo, hash, rol) => {
  const result = await pool.query(
    `INSERT INTO usuario (nombre, correo, contrasena_hash, rol)
     VALUES ($1, $2, $3, $4) RETURNING id_usuario, nombre, correo, rol`,
    [nombre, correo, hash, rol]
  );
  return result.rows[0];
};

const toggleSuspendido = async (id_usuario) => {
  const result = await pool.query(
    `UPDATE usuario SET suspendido = NOT suspendido
     WHERE id_usuario=$1 RETURNING *`,
    [id_usuario]
  );
  return result.rows[0];
};

const getAll = async () => {
  const result = await pool.query(
    'SELECT id_usuario, nombre, correo, rol, suspendido FROM usuario ORDER BY fecha_registro DESC'
  );
  return result.rows;
};

module.exports = { findByCorreo, crear, toggleSuspendido, getAll };