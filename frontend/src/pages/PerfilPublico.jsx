import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function PerfilPublico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [puntuacion, setPuntuacion] = useState(5);
  const [comentario, setComentario] = useState('');
  const [mensajeCalif, setMensajeCalif] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get(`/perfiles/${id}`)
      .then(r => setPerfil(r.data))
      .catch(() => navigate('/busqueda'))
      .finally(() => setCargando(false));
  }, [id]);

  const calificar = async () => {
    try {
      await api.post(`/perfiles/${id}/calificar`, { puntuacion, comentario });
      setMensajeCalif('✅ Calificación enviada');
      const r = await api.get(`/perfiles/${id}`);
      setPerfil(r.data);
    } catch (e) {
      setMensajeCalif(e.response?.data?.error || 'Error al calificar');
    }
  };

  if (cargando) return <div style={styles.loading}>Cargando perfil...</div>;
  if (!perfil) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={() => navigate('/busqueda')}>← Volver</button>
        <h2 style={styles.titulo}>Perfil del prestador</h2>
      </div>

      <div style={styles.contenido}>
        {/* Info principal */}
        <div style={styles.card}>
          <h2 style={styles.nombre}>{perfil.nombre_usuario}</h2>
          <p style={styles.desc}>{perfil.descripcion}</p>
          <div style={styles.promedio}>
            ⭐ {Number(perfil.promedio).toFixed(1)} ({perfil.total_calificaciones} reseñas)
          </div>

          <div style={styles.contactos}>
            {perfil.telefono && (
              <a href={`tel:${perfil.telefono}`} style={styles.btnTel}>📞 {perfil.telefono}</a>
            )}
            {perfil.whatsapp && (
              <a href={`https://wa.me/57${perfil.whatsapp}`} target="_blank" rel="noreferrer" style={styles.btnWsp}>
                💬 WhatsApp
              </a>
            )}
          </div>

          {perfil.categorias?.length > 0 && (
            <div style={styles.tags}>
              {perfil.categorias.map(c => (
                <span key={c.id_categoria} style={styles.tag}>{c.nombre}</span>
              ))}
            </div>
          )}

          {perfil.zonas?.length > 0 && (
            <p style={styles.zonas}>📍 {perfil.zonas.map(z => z.nombre_comuna).join(', ')}</p>
          )}
        </div>

        {/* Fotos */}
        {perfil.fotos?.length > 0 && (
          <div style={styles.card}>
            <h3 style={styles.seccion}>Trabajos realizados</h3>
            <div style={styles.fotos}>
              {perfil.fotos.map(f => (
                <img key={f.id_foto} src={f.url_cloudinary} alt="trabajo" style={styles.foto} />
              ))}
            </div>
          </div>
        )}

        {/* Calificaciones */}
        <div style={styles.card}>
          <h3 style={styles.seccion}>Reseñas</h3>
          {perfil.calificaciones?.length === 0 && <p style={styles.sinResenas}>Sin reseñas aún</p>}
          {perfil.calificaciones?.map(c => (
            <div key={c.id_calificacion} style={styles.resena}>
              <strong>{c.nombre_vecino}</strong>
              <span style={styles.estrellas}>{'⭐'.repeat(c.puntuacion)}</span>
              {c.comentario && <p style={styles.comentario}>{c.comentario}</p>}
            </div>
          ))}
        </div>

        {/* Formulario calificación */}
        {usuario?.rol === 'vecino' && (
          <div style={styles.card}>
            <h3 style={styles.seccion}>Deja tu calificación</h3>
            <div style={styles.formCalif}>
              <label style={styles.label}>Puntuación</label>
              <select style={styles.select} value={puntuacion} onChange={e => setPuntuacion(Number(e.target.value))}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{'⭐'.repeat(n)} ({n})</option>)}
              </select>
              <label style={styles.label}>Comentario (opcional)</label>
              <textarea style={styles.textarea} value={comentario} onChange={e => setComentario(e.target.value)} placeholder="Cuéntanos tu experiencia..." />
              <button style={styles.btnCalif} onClick={calificar}>Enviar calificación</button>
              {mensajeCalif && <p style={styles.mensajeCalif}>{mensajeCalif}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#F8F9FA', fontFamily: 'sans-serif' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: 18 },
  header: { backgroundColor: '#2D6A4F', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16 },
  btnVolver: { color: 'white', background: 'transparent', border: 'none', fontSize: 16, cursor: 'pointer' },
  titulo: { color: 'white', margin: 0 },
  contenido: { maxWidth: 720, margin: '32px auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 20 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  nombre: { margin: '0 0 8px', color: '#1B1B1B', fontSize: 24 },
  desc: { color: '#555', margin: '0 0 12px' },
  promedio: { fontSize: 18, marginBottom: 16 },
  contactos: { display: 'flex', gap: 12, marginBottom: 16 },
  btnTel: { padding: '10px 18px', backgroundColor: '#52B788', color: 'white', borderRadius: 8, textDecoration: 'none', fontSize: 14 },
  btnWsp: { padding: '10px 18px', backgroundColor: '#25D366', color: 'white', borderRadius: 8, textDecoration: 'none', fontSize: 14 },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tag: { backgroundColor: '#D8F3DC', color: '#2D6A4F', padding: '4px 12px', borderRadius: 20, fontSize: 13 },
  zonas: { color: '#666', fontSize: 14, margin: 0 },
  seccion: { margin: '0 0 16px', color: '#2D6A4F' },
  fotos: { display: 'flex', flexWrap: 'wrap', gap: 12 },
  foto: { width: 150, height: 120, objectFit: 'cover', borderRadius: 8 },
  sinResenas: { color: '#999', fontStyle: 'italic' },
  resena: { borderBottom: '1px solid #eee', paddingBottom: 12, marginBottom: 12 },
  estrellas: { marginLeft: 8 },
  comentario: { margin: '4px 0 0', color: '#555', fontSize: 14 },
  formCalif: { display: 'flex', flexDirection: 'column', gap: 10 },
  label: { fontWeight: '600', color: '#333', fontSize: 14 },
  select: { padding: '10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 },
  textarea: { padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 14, minHeight: 80, resize: 'vertical' },
  btnCalif: { padding: '12px', backgroundColor: '#2D6A4F', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer' },
  mensajeCalif: { textAlign: 'center', fontWeight: 'bold', color: '#2D6A4F' },
};