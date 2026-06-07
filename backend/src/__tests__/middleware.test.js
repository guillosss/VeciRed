jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn().mockReturnValue('fake_token')
}));

const jwt = require('jsonwebtoken');
const { verificarToken, soloRol } = require('../middleware/auth.middleware');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Middleware - verificarToken', () => {
  beforeEach(() => jest.clearAllMocks());

  test('retorna 401 si no hay token', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    verificarToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token requerido' });
    expect(next).not.toHaveBeenCalled();
  });

  test('llama next si token es válido', () => {
    const decoded = { id: '123', rol: 'vecino' };
    jwt.verify.mockReturnValueOnce(decoded);
    const req = { headers: { authorization: 'Bearer valid_token' } };
    const res = mockRes();
    const next = jest.fn();
    verificarToken(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.usuario).toEqual(decoded);
  });

  test('retorna 403 si token es inválido', () => {
    jwt.verify.mockImplementationOnce(() => { throw new Error('invalid'); });
    const req = { headers: { authorization: 'Bearer invalid_token' } };
    const res = mockRes();
    const next = jest.fn();
    verificarToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
  });
});

describe('Auth Middleware - soloRol', () => {
  beforeEach(() => jest.clearAllMocks());

  test('permite acceso si rol está autorizado', () => {
    const req = { usuario: { rol: 'administrador' } };
    const res = mockRes();
    const next = jest.fn();
    soloRol('administrador')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('retorna 403 si rol no está autorizado', () => {
    const req = { usuario: { rol: 'vecino' } };
    const res = mockRes();
    const next = jest.fn();
    soloRol('administrador')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'No autorizado para este rol' });
  });
});