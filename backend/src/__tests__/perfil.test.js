jest.mock('../db', () => ({ query: jest.fn() }));
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: { upload: jest.fn() }
  }
}));
jest.mock('../models/perfil.model');
jest.mock('../models/calificacion.model');

const pool = require('../db');
const perfilModel = require('../models/perfil.model');
const calificacionModel = require('../models/calificacion.model');
const {
  getMiPerfil, crearPerfil, actualizarPerfil,
  buscar, getPerfilPublico, calificar
} = require('../controllers/perfil.controller');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Perfil Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getMiPerfil retorna 404 si no hay perfil', async () => {
    perfilModel.getByUsuario.mockResolvedValueOnce(null);
    const req = { usuario: { id: '1' } };
    const res = mockRes();
    await getMiPerfil(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('getMiPerfil retorna perfil completo', async () => {
    const perfil = { id_perfil: '1', descripcion: 'Test' };
    perfilModel.getByUsuario.mockResolvedValueOnce(perfil);
    perfilModel.getCategorias.mockResolvedValueOnce([]);
    perfilModel.getZonas.mockResolvedValueOnce([]);
    perfilModel.getFotos.mockResolvedValueOnce([]);
    const req = { usuario: { id: '1' } };
    const res = mockRes();
    await getMiPerfil(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  test('getMiPerfil retorna 500 si falla', async () => {
    perfilModel.getByUsuario.mockRejectedValueOnce(new Error('Error BD'));
    const req = { usuario: { id: '1' } };
    const res = mockRes();
    await getMiPerfil(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('crearPerfil retorna 400 si ya existe perfil', async () => {
    perfilModel.getByUsuario.mockResolvedValueOnce({ id_perfil: '1' });
    const req = { usuario: { id: '1' }, body: {} };
    const res = mockRes();
    await crearPerfil(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('crearPerfil crea perfil exitosamente', async () => {
    perfilModel.getByUsuario.mockResolvedValueOnce(null);
    perfilModel.crear.mockResolvedValueOnce({ id_perfil: '2' });
    const req = { usuario: { id: '1' }, body: { descripcion: 'Test', telefono: '123', whatsapp: '123', categorias: [], zonas: [] } };
    const res = mockRes();
    await crearPerfil(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('crearPerfil retorna 500 si falla', async () => {
    perfilModel.getByUsuario.mockRejectedValueOnce(new Error('Error BD'));
    const req = { usuario: { id: '1' }, body: {} };
    const res = mockRes();
    await crearPerfil(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('actualizarPerfil actualiza perfil existente', async () => {
    perfilModel.getByUsuario.mockResolvedValueOnce({ id_perfil: '1' });
    perfilModel.actualizar.mockResolvedValueOnce({ id_perfil: '1' });
    perfilModel.setCategorias.mockResolvedValueOnce();
    perfilModel.setZonas.mockResolvedValueOnce();
    const req = { usuario: { id: '1' }, body: { descripcion: 'Test', categorias: [], zonas: [] } };
    const res = mockRes();
    await actualizarPerfil(req, res);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Perfil actualizado correctamente' });
  });

  test('actualizarPerfil crea perfil si no existe', async () => {
    perfilModel.getByUsuario.mockResolvedValueOnce(null);
    perfilModel.crear.mockResolvedValueOnce({ id_perfil: '3' });
    perfilModel.setCategorias.mockResolvedValueOnce();
    perfilModel.setZonas.mockResolvedValueOnce();
    const req = { usuario: { id: '1' }, body: { descripcion: 'Test', categorias: [], zonas: [] } };
    const res = mockRes();
    await actualizarPerfil(req, res);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Perfil actualizado correctamente' });
  });

  test('buscar retorna resultados', async () => {
    perfilModel.buscar.mockResolvedValueOnce([{ id_perfil: '1' }]);
    const req = { query: { categoria: 'Plomería', zona: 'Bello' } };
    const res = mockRes();
    await buscar(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  test('buscar sin filtros retorna resultados', async () => {
    perfilModel.buscar.mockResolvedValueOnce([]);
    const req = { query: {} };
    const res = mockRes();
    await buscar(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  test('getPerfilPublico retorna 404 si no existe', async () => {
    perfilModel.getPerfilCompleto.mockResolvedValueOnce(null);
    const req = { params: { id: '999' } };
    const res = mockRes();
    await getPerfilPublico(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('getPerfilPublico retorna perfil', async () => {
    perfilModel.getPerfilCompleto.mockResolvedValueOnce({ id_perfil: '1' });
    const req = { params: { id: '1' } };
    const res = mockRes();
    await getPerfilPublico(req, res);
    expect(res.json).toHaveBeenCalledWith({ id_perfil: '1' });
  });

  test('calificar retorna 400 si puntuacion fuera de rango', async () => {
    const req = { body: { puntuacion: 6, comentario: '' }, params: { id: '1' }, usuario: { id: '2' } };
    const res = mockRes();
    await calificar(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('calificar retorna 400 si puntuacion menor a 1', async () => {
    const req = { body: { puntuacion: 0, comentario: '' }, params: { id: '1' }, usuario: { id: '2' } };
    const res = mockRes();
    await calificar(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('calificar retorna 400 si ya calificó', async () => {
    calificacionModel.yaCalificó.mockResolvedValueOnce(true);
    const req = { body: { puntuacion: 5, comentario: '' }, params: { id: '1' }, usuario: { id: '2' } };
    const res = mockRes();
    await calificar(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('calificar crea calificación exitosamente', async () => {
    calificacionModel.yaCalificó.mockResolvedValueOnce(false);
    calificacionModel.crear.mockResolvedValueOnce({ id_calificacion: '1', puntuacion: 5 });
    const req = { body: { puntuacion: 5, comentario: 'Excelente' }, params: { id: '1' }, usuario: { id: '2' } };
    const res = mockRes();
    await calificar(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('Calificacion Model', () => {
  beforeEach(() => jest.clearAllMocks());

  test('yaCalificó retorna true si existe', async () => {
    pool.query.mockResolvedValueOnce({ rows: [1] });
    const calModel = jest.requireActual('../models/calificacion.model');
    const result = await calModel.yaCalificó('1', '2');
    expect(result).toBe(true);
  });

  test('yaCalificó retorna false si no existe', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const calModel = jest.requireActual('../models/calificacion.model');
    const result = await calModel.yaCalificó('99', '99');
    expect(result).toBe(false);
  });
});

describe('Categoria Model', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getAll retorna categorías', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ nombre: 'Plomería' }] });
    const catModel = jest.requireActual('../models/categoria.model');
    const result = await catModel.getAll();
    expect(Array.isArray(result)).toBe(true);
  });

  test('crear inserta categoría', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ nombre: 'Pintura' }] });
    const catModel = jest.requireActual('../models/categoria.model');
    const result = await catModel.crear('Pintura');
    expect(result).toBeDefined();
  });
});