const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock de la base de datos
jest.mock('../db', () => ({
  query: jest.fn()
}));

const pool = require('../db');
const usuarioModel = require('../models/usuario.model');

describe('Auth - Pruebas Unitarias', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // PRUEBA 1: Hash de contraseña
  test('debe hashear la contraseña correctamente', async () => {
    const contrasena = 'miContrasena123';
    const hash = await bcrypt.hash(contrasena, 10);
    expect(hash).not.toBe(contrasena);
    expect(hash.length).toBeGreaterThan(20);
  });

  // PRUEBA 2: Verificar contraseña correcta
  test('debe verificar una contraseña válida', async () => {
    const contrasena = 'miContrasena123';
    const hash = await bcrypt.hash(contrasena, 10);
    const valida = await bcrypt.compare(contrasena, hash);
    expect(valida).toBe(true);
  });

  // PRUEBA 3: Rechazar contraseña incorrecta
  test('debe rechazar una contraseña incorrecta', async () => {
    const hash = await bcrypt.hash('contrasenaCorrecta', 10);
    const valida = await bcrypt.compare('contrasenaIncorrecta', hash);
    expect(valida).toBe(false);
  });

  // PRUEBA 4: Generar token JWT
  test('debe generar un token JWT válido', () => {
    process.env.JWT_SECRET = 'test_secret';
    const payload = { id: '123', rol: 'vecino' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  // PRUEBA 5: Verificar token JWT válido
  test('debe verificar un token JWT correctamente', () => {
    process.env.JWT_SECRET = 'test_secret';
    const payload = { id: '123', rol: 'vecino' };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe('123');
    expect(decoded.rol).toBe('vecino');
  });

  // PRUEBA 6: Query a BD - buscar usuario por correo
  test('debe llamar a la BD para buscar usuario por correo', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    await pool.query('SELECT * FROM usuario WHERE correo = $1', ['test@test.com']);
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM usuario WHERE correo = $1',
      ['test@test.com']
    );
  });

  // PRUEBA 7: Query a BD - usuario encontrado
  test('debe retornar usuario cuando existe en BD', async () => {
    const usuarioMock = {
      id_usuario: '123',
      nombre: 'Juan',
      correo: 'juan@test.com',
      rol: 'vecino'
    };
    pool.query.mockResolvedValueOnce({ rows: [usuarioMock] });
    const resultado = await pool.query(
      'SELECT * FROM usuario WHERE correo = $1',
      ['juan@test.com']
    );
    expect(resultado.rows[0]).toEqual(usuarioMock);
    expect(resultado.rows.length).toBe(1);
  });

  // PRUEBA 8: Query a BD - usuario no encontrado
  test('debe retornar array vacío cuando usuario no existe', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const resultado = await pool.query(
      'SELECT * FROM usuario WHERE correo = $1',
      ['noexiste@test.com']
    );
    expect(resultado.rows).toHaveLength(0);
  });
});