const pool = require('../db');

const crear = async (id_vecino, id_perfil, puntuacion, comentario) => {
  const result = await pool.query(
    `INSERT INTO calificacion (id_vecino, id_perfil, puntuacion, comentario, visible)
     VALUES ($1, $2, $3, $4, true) RETURNING *`,
    [id_vecino, id_perfil, puntuacion, comentario || null]
  );
  return result.rows[0];
};

const yaCalificó = async (id_vecino, id_perfil) => {
  const result = await pool.query(
    'SELECT 1 FROM calificacion WHERE id_vecino=$1 AND id_perfil=$2',
    [id_vecino, id_perfil]
  );
  return result.rows.length > 0;
};

const toggleVisible = async (id_calificacion) => {
  const result = await pool.query(
    `UPDATE calificacion SET visible = NOT visible
     WHERE id_calificacion=$1 RETURNING *`,
    [id_calificacion]
  );
  return result.rows[0];
};

const getAll = async () => {
  const result = await pool.query(
    `SELECT c.*, u.nombre AS nombre_vecino, p.descripcion AS perfil_descripcion
     FROM calificacion c
     JOIN usuario u ON u.id_usuario = c.id_vecino
     JOIN perfil_prestador p ON p.id_perfil = c.id_perfil
     ORDER BY c.fecha DESC`
  );
  return result.rows;
};

module.exports = { crear, yaCalificó, toggleVisible, getAll };