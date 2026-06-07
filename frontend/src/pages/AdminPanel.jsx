import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('usuarios');
  const [usuarios, setUsuarios] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [nuevaCat, setNuevaCat] = useState('');

  useEffect(() => {
    if (tab === 'usuarios') api.get('/admin/usuarios').then(r => setUsuarios(r.data));
    if (tab === 'calificaciones') api.get('/admin/calificaciones').then(r => setCalificaciones(r.data));
    if (tab === 'categorias') api.get('/admin/categorias').then(r => setCategorias(r.data));
  }, [tab]);

  const suspender = async (id) => {
    await api.patch(`/admin/usuarios/${id}/suspender`);
    const r = await api.get('/admin/usuarios');
    setUsuarios(r.data);
  };

  const moderar = async (id) => {
    await api.patch(`/admin/calificaciones/${id}/moderar`);
    const r = await api.get('/admin/calificaciones');
    setCalificaciones(r.data);
  };

  const crearCategoria = async () => {
    if (!nuevaCat.trim()) return;
    await api.post('/admin/categorias', { nombre: nuevaCat });
    setNuevaCat('');
    const r = await api.get('/admin/categorias');
    setCategorias(r.data);
  };

  const eliminarCategoria = async (id) => {
    await api.delete(`/admin/categorias/${id}`);
    const r = await api.get('/admin/categorias');
    setCategorias(r.data);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={() => navigate('/home')}>← Inicio</button>
        <h2 style={styles.titulo}>Panel de administración</h2>
      </div>

      <div style={styles.tabs}>
        {['usuarios','calificaciones','categorias'].map(t => (
          <button key={t} style={{ ...styles.tab, ...(tab === t ? styles.tabActivo : {}) }}
            onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.contenido}>
        {tab === 'usuarios' && (
          <div style={styles.card}>
            <h3 style={styles.seccion}>Usuarios registrados</h3>
            {usuarios.map(u => (
              <div key={u.id_usuario} style={styles.fila}>
                <div>
                  <strong>{u.nombre}</strong>
                  <span style={styles.rol}> [{u.rol}]</span>
                  <span style={styles.correo}> {u.correo}</span>
                </div>
                <button style={styles.btnSuspender} onClick={() => suspender(u.id_usuario)}>
                  {u.suspendido ? 'Activar' : 'Suspender'}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'calificaciones' && (
          <div style={styles.card}>
            <h3 style={styles.seccion}>Moderar calificaciones</h3>
            {calificaciones.map(c => (
              <div key={c.id_calificacion} style={styles.fila}>
                <div>
                  <strong>{c.nombre_vecino}</strong> → {'⭐'.repeat(c.puntuacion)}
                  {c.comentario && <p style={styles.comentario}>{c.comentario}</p>}
                  <span style={{ color: c.visible ? 'green' : 'red', fontSize: 12 }}>
                    {c.visible ? 'Visible' : 'Oculta'}
                  </span>
                </div>
                <button style={styles.btnModerar} onClick={() => moderar(c.id_calificacion)}>
                  {c.visible ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'categorias' && (
          <div style={styles.card}>
            <h3 style={styles.seccion}>Gestionar categorías</h3>
            <div style={styles.nuevaCat}>
              <input style={styles.input} value={nuevaCat}
                onChange={e => setNuevaCat(e.target.value)}
                placeholder="Nueva categoría..." />
              <button style={styles.btnAgregar} onClick={crearCategoria}>Agregar</button>
            </div>
            {categorias.map(c => (
              <div key={c.id_categoria} style={styles.fila}>
                <span>{c.nombre}</span>
                <button style={styles.btnEliminar} onClick={() => eliminarCategoria(c.id_categoria)}>
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#F8F9FA', fontFamily: 'sans-serif' },
  header: { backgroundColor: '#2D6A4F', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16 },
  btnVolver: { color: 'white', background: 'transparent', border: 'none', fontSize: 16, cursor: 'pointer' },
  titulo: { color: 'white', margin: 0 },
  tabs: { display: 'flex', gap: 0, backgroundColor: 'white', borderBottom: '2px solid #eee' },
  tab: { padding: '14px 28px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15, color: '#666' },
  tabActivo: { color: '#2D6A4F', borderBottom: '2px solid #2D6A4F', fontWeight: 'bold' },
  contenido: { maxWidth: 800, margin: '32px auto', padding: '0 16px' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  seccion: { margin: '0 0 20px', color: '#2D6A4F' },
  fila: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  rol: { color: '#52B788', fontSize: 13 },
  correo: { color: '#999', fontSize: 13 },
  comentario: { margin: '4px 0 0', color: '#555', fontSize: 13 },
  btnSuspender: { padding: '6px 14px', backgroundColor: '#FF6B6B', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  btnModerar: { padding: '6px 14px', backgroundColor: '#FFB703', color: '#1B1B1B', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  nuevaCat: { display: 'flex', gap: 10, marginBottom: 20 },
  input: { flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 },
  btnAgregar: { padding: '10px 20px', backgroundColor: '#2D6A4F', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' },
  btnEliminar: { padding: '6px 14px', backgroundColor: '#FF6B6B', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
};