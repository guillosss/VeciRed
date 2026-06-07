import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function Busqueda() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState(params.get('categoria') || '');
  const [zona, setZona] = useState('');
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [buscado, setBuscado] = useState(false);

  const categorias = ['Electricidad','Plomería','Pintura','Costura','Carpintería','Jardinería','Cerrajería','Techado','Fumigación','Cuidado de adultos mayores'];
  const comunas = ['Aranjuez','Castilla','El Poblado','Laureles','Belén','Robledo','Villa Hermosa','Buenos Aires','La Candelaria','Guayabal','Manrique','Doce de Octubre','San Javier','El Jardín','Palmitas','San Cristóbal'];

  useEffect(() => {
    if (params.get('categoria')) buscar();
  }, []);

  const buscar = async () => {
    setCargando(true);
    setBuscado(true);
    try {
      const res = await api.get('/perfiles/buscar', { params: { categoria, zona } });
      setResultados(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  const estrellas = (promedio) => '⭐'.repeat(Math.round(Number(promedio)));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={() => navigate('/home')}>← Volver</button>
        <h2 style={styles.titulo}>Buscar servicios</h2>
      </div>

      <div style={styles.filtros}>
        <select style={styles.select} value={categoria} onChange={e => setCategoria(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select style={styles.select} value={zona} onChange={e => setZona(e.target.value)}>
          <option value="">Todas las comunas</option>
          {comunas.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button style={styles.btnBuscar} onClick={buscar}>Buscar</button>
      </div>

      <div style={styles.resultados}>
        {cargando && <p style={styles.mensaje}>Buscando...</p>}
        {!cargando && buscado && resultados.length === 0 && (
          <p style={styles.mensaje}>No hay prestadores en esta zona para esa categoría.</p>
        )}
        {resultados.map(p => (
          <div key={p.id_perfil} style={styles.card} onClick={() => navigate(`/perfil/${p.id_perfil}`)}>
            <div style={styles.cardInfo}>
              <h3 style={styles.cardNombre}>{p.nombre_usuario}</h3>
              <p style={styles.cardDesc}>{p.descripcion}</p>
              <span style={styles.cardEstrellas}>
                {estrellas(p.promedio)} ({p.total_calificaciones} reseñas)
              </span>
            </div>
            <button style={styles.btnVer}>Ver perfil →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#F8F9FA', fontFamily: 'sans-serif' },
  header: { backgroundColor: '#2D6A4F', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16 },
  btnVolver: { color: 'white', background: 'transparent', border: 'none', fontSize: 16, cursor: 'pointer' },
  titulo: { color: 'white', margin: 0 },
  filtros: { display: 'flex', gap: 12, padding: '24px 32px', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' },
  select: { padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, flex: 1 },
  btnBuscar: { padding: '10px 24px', backgroundColor: '#2D6A4F', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' },
  resultados: { padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 },
  mensaje: { textAlign: 'center', color: '#666', fontSize: 16, marginTop: 40 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer' },
  cardInfo: { flex: 1 },
  cardNombre: { margin: '0 0 8px', color: '#1B1B1B', fontSize: 18 },
  cardDesc: { margin: '0 0 8px', color: '#666', fontSize: 14 },
  cardEstrellas: { fontSize: 13, color: '#555' },
  btnVer: { padding: '8px 16px', backgroundColor: '#FFB703', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' },
};