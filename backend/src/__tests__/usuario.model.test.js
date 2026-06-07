jest.mock('../db', () => ({
  query: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('fake_token')
}));

const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuario.model');
const { registro, login } = require('../controllers/auth.controller');

// Helper para crear req/res mock
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Usuario Model', () => {
  beforeEach(() => jest.clearAllMocks());

  test('findByCorreo retorna usuario existente', async () => {
    const usuario = { id_usuario: '1', correo: 'juan@test.com', rol: 'vecino' };
    pool.query.mockResolvedValueOnce({ rows: [usuario] });
    const result = await usuarioModel.findByCorreo('juan@test.com');
    expect(result).toEqual(usuario);
  });

  test('findByCorreo retorna undefined si no existe', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const result = await usuarioModel.findByCorreo('no@test.com');
    expect(result).toBeFalsy();
  });

  test('crear inserta nuevo usuario y lo retorna', async () => {
    const nuevo = { id_usuario: '2', nombre: 'Maria', correo: 'maria@test.com', rol: 'vecino' };
    pool.query.mockResolvedValueOnce({ rows: [nuevo] });
    const result = await usuarioModel.crear('Maria', 'maria@test.com', 'hash', 'vecino');
    expect(result).toEqual(nuevo);
  });

  test('toggleSuspendido cambia estado del usuario', async () => {
    const usuario = { id_usuario: '1', suspendido: true };
    pool.query.mockResolvedValueOnce({ rows: [usuario] });
    const result = await usuarioModel.toggleSuspendido('1');
    expect(result).toEqual(usuario);
  });

  test('getAll retorna lista de usuarios', async () => {
    const usuarios = [
      { id_usuario: '1', nombre: 'Juan', correo: 'juan@test.com', rol: 'vecino', suspendido: false },
      { id_usuario: '2', nombre: 'Maria', correo: 'maria@test.com', rol: 'prestador', suspendido: false }
    ];
    pool.query.mockResolvedValueOnce({ rows: usuarios });
    const result = await usuarioModel.getAll();
    expect(result).toHaveLength(2);
    expect(result[0].nombre).toBe('Juan');
  });
});

describe('Auth Controller - registro', () => {
  beforeEach(() => jest.clearAllMocks());

  test('registro exitoso retorna 201', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] }) // findByCorreo
      .mockResolvedValueOnce({ rows: [{ id_usuario: '1', nombre: 'Juan', correo: 'juan@test.com', rol: 'vecino' }] }); // crear

    const req = { body: { nombre: 'Juan', correo: 'juan@test.com', contrasena: '123456', rol: 'vecino' } };
    const res = mockRes();

    await registro(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensaje: 'Usuario creado' }));
  });

  test('registro falla si correo ya existe', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id_usuario: '1', correo: 'juan@test.com' }] });

    const req = { body: { nombre: 'Juan', correo: 'juan@test.com', contrasena: '123456', rol: 'vecino' } };
    const res = mockRes();

    await registro(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El correo ya está registrado' });
  });

  test('registro retorna 500 si hay error de BD', async () => {
    pool.query.mockRejectedValueOnce(new Error('Error BD'));

    const req = { body: { nombre: 'Juan', correo: 'juan@test.com', contrasena: '123456', rol: 'vecino' } };
    const res = mockRes();

    await registro(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('Auth Controller - login', () => {
  beforeEach(() => jest.clearAllMocks());

  test('login exitoso retorna token', async () => {
    process.env.JWT_SECRET = 'test_secret';
    const usuario = { id_usuario: '1', nombre: 'Juan', correo: 'juan@test.com', rol: 'vecino', contrasena_hash: 'hash' };
    pool.query.mockResolvedValueOnce({ rows: [usuario] });
    bcrypt.compare.mockResolvedValueOnce(true);

    const req = { body: { correo: 'juan@test.com', contrasena: '123456' } };
    const res = mockRes();

    await login(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'fake_token' }));
  });

  test('login falla si usuario no existe', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = { body: { correo: 'no@test.com', contrasena: '123456' } };
    const res = mockRes();

    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Credenciales inválidas' });
  });

  test('login falla si contraseña incorrecta', async () => {
    const usuario = { id_usuario: '1', correo: 'juan@test.com', contrasena_hash: 'hash' };
    pool.query.mockResolvedValueOnce({ rows: [usuario] });
    bcrypt.compare.mockResolvedValueOnce(false);

    const req = { body: { correo: 'juan@test.com', contrasena: 'incorrecta' } };
    const res = mockRes();

    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('login retorna 500 si hay error de BD', async () => {
    pool.query.mockRejectedValueOnce(new Error('Error BD'));

    const req = { body: { correo: 'juan@test.com', contrasena: '123456' } };
    const res = mockRes();

    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});