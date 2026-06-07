const pool = require('../db');

// Obtener perfil de un prestador por id_usuario
const getByUsuario = async (id_usuario) => {
  const result = await pool.query(
    `SELECT p.*, 
      COALESCE(AVG(c.puntuacion), 0) AS promedio,
      COUNT(c.id_calificacion) AS total_calificaciones
     FROM perfil_prestador p
     LEFT JOIN calificacion c ON c.id_perfil = p.id_perfil
     WHERE p.id_usuario = $1
     GROUP BY p.id_perfil`,
    [id_usuario]
  );
  return result.rows[0];
};

// Crear perfil prestador
const crear = async (id_usuario, descripcion, telefono, whatsapp) => {
  const result = await pool.query(
    `INSERT INTO perfil_prestador (id_usuario, descripcion, telefono, whatsapp, activo)
     VALUES ($1, $2, $3, $4, true) RETURNING *`,
    [id_usuario, descripcion, telefono, whatsapp]
  );
  return result.rows[0];
};

// Actualizar perfil
const actualizar = async (id_perfil, descripcion, telefono, whatsapp) => {
  const result = await pool.query(
    `UPDATE perfil_prestador SET descripcion=$1, telefono=$2, whatsapp=$3
     WHERE id_perfil=$4 RETURNING *`,
    [descripcion, telefono, whatsapp, id_perfil]
  );
  return result.rows[0];
};

// Obtener categorías del perfil
const getCategorias = async (id_perfil) => {
  const result = await pool.query(
    `SELECT c.id_categoria, c.nombre FROM categoria c
     JOIN perfil_categoria pc ON pc.id_categoria = c.id_categoria
     WHERE pc.id_perfil = $1`,
    [id_perfil]
  );
  return result.rows;
};

// Asignar categorías (reemplaza las anteriores)
const setCategorias = async (id_perfil, categorias) => {
  await pool.query('DELETE FROM perfil_categoria WHERE id_perfil = $1', [id_perfil]);
  for (const id_categoria of categorias) {
    await pool.query(
      'INSERT INTO perfil_categoria (id_perfil, id_categoria) VALUES ($1, $2)',
      [id_perfil, id_categoria]
    );
  }
};

// Obtener zonas del perfil
const getZonas = async (id_perfil) => {
  const result = await pool.query(
    'SELECT * FROM zona_cobertura WHERE id_perfil = $1',
    [id_perfil]
  );
  return result.rows;
};

// Asignar zonas (reemplaza las anteriores)
const setZonas = async (id_perfil, zonas) => {
  await pool.query('DELETE FROM zona_cobertura WHERE id_perfil = $1', [id_perfil]);
  for (const nombre_comuna of zonas) {
    await pool.query(
      'INSERT INTO zona_cobertura (id_perfil, nombre_comuna) VALUES ($1, $2)',
      [id_perfil, nombre_comuna]
    );
  }
};

// Agregar foto
const agregarFoto = async (id_perfil, url_cloudinary) => {
  const result = await pool.query(
    'INSERT INTO foto (id_perfil, url_cloudinary) VALUES ($1, $2) RETURNING *',
    [id_perfil, url_cloudinary]
  );
  return result.rows[0];
};

// Obtener fotos
const getFotos = async (id_perfil) => {
  const result = await pool.query(
    'SELECT * FROM foto WHERE id_perfil = $1 ORDER BY fecha_subida DESC',
    [id_perfil]
  );
  return result.rows;
};

// Buscar prestadores por categoría y/o zona
const buscar = async (categoria, zona) => {
  let query = `
    SELECT DISTINCT p.*, u.nombre AS nombre_usuario,
      COALESCE(AVG(c.puntuacion), 0) AS promedio,
      COUNT(c.id_calificacion) AS total_calificaciones
    FROM perfil_prestador p
    JOIN usuario u ON u.id_usuario = p.id_usuario
    LEFT JOIN calificacion c ON c.id_perfil = p.id_perfil
    WHERE p.activo = true
  `;
  const params = [];

  if (categoria) {
    params.push(categoria);
    query += ` AND EXISTS (
      SELECT 1 FROM perfil_categoria pc
      JOIN categoria cat ON cat.id_categoria = pc.id_categoria
      WHERE pc.id_perfil = p.id_perfil AND LOWER(cat.nombre) LIKE LOWER($${params.length})
    )`;
  }

  if (zona) {
    params.push(`%${zona}%`);
    query += ` AND EXISTS (
      SELECT 1 FROM zona_cobertura z
      WHERE z.id_perfil = p.id_perfil AND LOWER(z.nombre_comuna) LIKE LOWER($${params.length})
    )`;
  }

  query += ' GROUP BY p.id_perfil, u.nombre ORDER BY promedio DESC';
  const result = await pool.query(query, params);
  return result.rows;
};

// Perfil completo público (con fotos, categorías, zonas, calificaciones)
const getPerfilCompleto = async (id_perfil) => {
  const perfil = await pool.query(
    `SELECT p.*, u.nombre AS nombre_usuario,
      COALESCE(AVG(c.puntuacion), 0) AS promedio,
      COUNT(c.id_calificacion) AS total_calificaciones
     FROM perfil_prestador p
     JOIN usuario u ON u.id_usuario = p.id_usuario
     LEFT JOIN calificacion c ON c.id_perfil = p.id_perfil
     WHERE p.id_perfil = $1
     GROUP BY p.id_perfil, u.nombre`,
    [id_perfil]
  );

  if (!perfil.rows[0]) return null;

  const fotos = await getFotos(id_perfil);
  const categorias = await getCategorias(id_perfil);
  const zonas = await getZonas(id_perfil);

  const calificaciones = await pool.query(
    `SELECT c.*, u.nombre AS nombre_vecino FROM calificacion c
     JOIN usuario u ON u.id_usuario = c.id_vecino
     WHERE c.id_perfil = $1 AND c.visible = true
     ORDER BY c.fecha DESC`,
    [id_perfil]
  );

  return {
    ...perfil.rows[0],
    fotos,
    categorias,
    zonas,
    calificaciones: calificaciones.rows
  };
};

module.exports = {
  getByUsuario, crear, actualizar,
  getCategorias, setCategorias,
  getZonas, setZonas,
  agregarFoto, getFotos,
  buscar, getPerfilCompleto
};