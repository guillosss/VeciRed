const pool = require('../db');

const getAll = async () => {
  const result = await pool.query('SELECT * FROM categoria ORDER BY nombre');
  return result.rows;
};

const crear = async (nombre) => {
  const result = await pool.query(
    'INSERT INTO categoria (nombre) VALUES ($1) RETURNING *',
    [nombre]
  );
  return result.rows[0];
};

const eliminar = async (id_categoria) => {
  await pool.query('DELETE FROM categoria WHERE id_categoria=$1', [id_categoria]);
};

module.exports = { getAll, crear, eliminar };