const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Mock de la BD
jest.mock('../db', () => ({
  query: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('fake_token'),
  verify: jest.fn()
}));

const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Crear app de prueba
const authRoutes = require('../routes/auth.routes');
const perfilRoutes = require('../routes/perfil.routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/perfiles', perfilRoutes);

describe('Pruebas de Integración - Auth', () => {
  beforeEach(() => jest.clearAllMocks());

  // INTEGRACIÓN 1: Flujo completo de registro
  test('POST /api/auth/registro - registro exitoso', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id_usuario: '1', nombre: 'Juan', correo: 'juan@test.com', rol: 'vecino' }] });

    const res = await request(app)
      .post('/api/auth/registro')
      .send({ nombre: 'Juan', correo: 'juan@test.com', contrasena: '123456', rol: 'vecino' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('mensaje', 'Usuario creado');
    expect(res.body).toHaveProperty('usuario');
  });

  // INTEGRACIÓN 2: Registro con correo duplicado
  test('POST /api/auth/registro - correo duplicado retorna 400', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id_usuario: '1', correo: 'juan@test.com' }] });

    const res = await request(app)
      .post('/api/auth/registro')
      .send({ nombre: 'Juan', correo: 'juan@test.com', contrasena: '123456', rol: 'vecino' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'El correo ya está registrado');
  });

  // INTEGRACIÓN 3: Flujo completo de login exitoso
  test('POST /api/auth/login - login exitoso retorna token', async () => {
    const usuarioMock = {
      id_usuario: '1',
      nombre: 'Juan',
      correo: 'juan@test.com',
      rol: 'vecino',
      contrasena_hash: 'hashedPassword'
    };
    pool.query.mockResolvedValueOnce({ rows: [usuarioMock] });
    bcrypt.compare.mockResolvedValueOnce(true);
    process.env.JWT_SECRET = 'test_secret';

    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'juan@test.com', contrasena: '123456' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('usuario');
    expect(res.body.usuario).toHaveProperty('rol', 'vecino');
  });

  // INTEGRACIÓN 4: Login con credenciales incorrectas
  test('POST /api/auth/login - credenciales incorrectas retorna 401', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'noexiste@test.com', contrasena: '123456' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Credenciales inválidas');
  });

  // INTEGRACIÓN 5: Buscar prestadores sin autenticación
  test('GET /api/perfiles/buscar - busqueda publica funciona', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/api/perfiles/buscar')
      .query({ categoria: 'Plomería' });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});