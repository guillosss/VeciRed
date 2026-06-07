jest.mock('../models/usuario.model');
jest.mock('../models/calificacion.model');
jest.mock('../models/categoria.model');

const usuarioModel = require('../models/usuario.model');
const calificacionModel = require('../models/calificacion.model');
const categoriaModel = require('../models/categoria.model');
const {
  getUsuarios, suspenderUsuario, getCalificaciones,
  moderarCalificacion, getCategorias, crearCategoria, eliminarCategoria
} = require('../controllers/admin.controller');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Admin Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getUsuarios retorna lista de usuarios', async () => {
    const usuarios = [{ id_usuario: '1', nombre: 'Juan' }];
    usuarioModel.getAll.mockResolvedValueOnce(usuarios);
    const req = {};
    const res = mockRes();
    await getUsuarios(req, res);
    expect(res.json).toHaveBeenCalledWith(usuarios);
  });

  test('getUsuarios retorna 500 si falla', async () => {
    usuarioModel.getAll.mockRejectedValueOnce(new Error('Error BD'));
    const res = mockRes();
    await getUsuarios({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('suspenderUsuario cambia estado', async () => {
    const usuario = { id_usuario: '1', suspendido: true };
    usuarioModel.toggleSuspendido.mockResolvedValueOnce(usuario);
    const req = { params: { id: '1' } };
    const res = mockRes();
    await suspenderUsuario(req, res);
    expect(res.json).toHaveBeenCalledWith(usuario);
  });

  test('getCalificaciones retorna lista', async () => {
    const cals = [{ id_calificacion: '1', puntuacion: 5 }];
    calificacionModel.getAll.mockResolvedValueOnce(cals);
    const res = mockRes();
    await getCalificaciones({}, res);
    expect(res.json).toHaveBeenCalledWith(cals);
  });

  test('moderarCalificacion cambia visibilidad', async () => {
    const cal = { id_calificacion: '1', visible: false };
    calificacionModel.toggleVisible.mockResolvedValueOnce(cal);
    const req = { params: { id: '1' } };
    const res = mockRes();
    await moderarCalificacion(req, res);
    expect(res.json).toHaveBeenCalledWith(cal);
  });

  test('getCategorias retorna lista', async () => {
    const cats = [{ id_categoria: '1', nombre: 'Plomería' }];
    categoriaModel.getAll.mockResolvedValueOnce(cats);
    const res = mockRes();
    await getCategorias({}, res);
    expect(res.json).toHaveBeenCalledWith(cats);
  });

  test('crearCategoria retorna 201', async () => {
    const cat = { id_categoria: '2', nombre: 'Pintura' };
    categoriaModel.crear.mockResolvedValueOnce(cat);
    const req = { body: { nombre: 'Pintura' } };
    const res = mockRes();
    await crearCategoria(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(cat);
  });

  test('eliminarCategoria retorna mensaje', async () => {
    categoriaModel.eliminar.mockResolvedValueOnce();
    const req = { params: { id: '1' } };
    const res = mockRes();
    await eliminarCategoria(req, res);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Categoría eliminada' });
  });
});