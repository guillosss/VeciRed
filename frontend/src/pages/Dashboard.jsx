import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState({ descripcion: '', telefono: '', whatsapp: '', categorias: [], zonas: [] });
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);
  const [listaCategorias, setListaCategorias] = useState([]);

  const comunas = ['Aranjuez','Castilla','El Poblado','Laureles','Belén','Robledo','Villa Hermosa','Buenos Aires','La Candelaria','Guayabal','Manrique','Doce de Octubre','San Javier'];

  useEffect(() => {
    api.get('/admin/categorias/publico').then(r => setListaCategorias(r.data));
    api.get('/perfiles/mio')
      .then(r => {
        setPerfil(r.data);
        setForm({
          descripcion: r.data.descripcion || '',
          telefono: r.data.telefono || '',
          whatsapp: r.data.whatsapp || '',
          categorias: r.data.categorias?.map(c => c.id_categoria) || [],
          zonas: r.data.zonas?.map(z => z.nombre_comuna) || [],
        });
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const toggleCategoria = (id) => {
    setForm(f => ({
      ...f,
      categorias: f.categorias.includes(id)
        ? f.categorias.filter(c => c !== id)
        : [...f.categorias, id]
    }));
  };

  const toggleZona = (zona) => {
    setForm(f => ({
      ...f,
      zonas: f.zonas.includes(zona)
        ? f.zonas.filter(z => z !== zona)
        : [...f.zonas, zona]
    }));
  };

  const guardar = async () => {
    try {
      await api.put('/perfiles', form);
      setMensaje('✅ Perfil guardado correctamente');
      const r = await api.get('/perfiles/mio');
      setPerfil(r.data);
    } catch (e) {
      setMensaje(e.response?.data?.error || 'Error al guardar');
    }
  };

  const subirFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await api.post('/perfiles/foto', { imagen_base64: reader.result });
        setMensaje('✅ Foto subida correctamente');
        const r = await api.get('/perfiles/mio');
        setPerfil(r.data);
      } catch {
        setMensaje('Error al subir foto');
      }
    };
    reader.readAsDataURL(file);
  };

  if (cargando) return <div style={styles.loading}>Cargando...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={() => navigate('/home')}>← Inicio</button>
        <h2 style={styles.titulo}>Mi perfil de prestador</h2>
      </div>

      <div style={styles.contenido}>
        <div style={styles.card}>
          <h3 style={styles.seccion}>Información del servicio</h3>
          <label style={styles.label}>Descripción</label>
          <textarea style={styles.textarea} value={form.descripcion}
            onChange={e => setForm({...form, descripcion: e.target.value})}
            placeholder="Describe tu servicio, experiencia y especialidad..." />
          <label style={styles.label}>Teléfono</label>
          <input style={styles.input} value={form.telefono}
            onChange={e => setForm({...form, telefono: e.target.value})}
            placeholder="Ej: 3001234567" />
          <label style={styles.label}>WhatsApp</label>
          <input style={styles.input} value={form.whatsapp}
            onChange={e => setForm({...form, whatsapp: e.target.value})}
            placeholder="Ej: 3001234567 (sin +57)" />
        </div>

        <div style={styles.card}>
          <h3 style={styles.seccion}>Categorías de servicio</h3>
          <div style={styles.chips}>
            {listaCategorias.map(cat => (
              <span key={cat.id_categoria}
                style={{ ...styles.chip, ...(form.categorias.includes(cat.id_categoria) ? styles.chipActivo : {}) }}
                onClick={() => toggleCategoria(cat.id_categoria)}>
                {cat.nombre}
              </span>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.seccion}>Zonas de cobertura</h3>
          <div style={styles.chips}>
            {comunas.map(zona => (
              <span key={zona}
                style={{ ...styles.chip, ...(form.zonas.includes(zona) ? styles.chipActivo : {}) }}
                onClick={() => toggleZona(zona)}>
                {zona}
              </span>
            ))}
          </div>
        </div>

        <button style={styles.btnGuardar} onClick={guardar}>
          Guardar perfil
        </button>
        {mensaje && <p style={styles.mensaje}>{mensaje}</p>}

        {perfil && (
          <div style={styles.card}>
            <h3 style={styles.seccion}>Fotos de trabajos realizados</h3>
            <input type="file" accept="image/*" onChange={subirFoto} style={styles.inputFile} />
            <div style={styles.fotos}>
              {perfil.fotos?.map(f => (
                <img key={f.id_foto} src={f.url_cloudinary} alt="trabajo" style={styles.foto} />
              ))}
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
  seccion: { margin: '0 0 16px', color: '#2D6A4F' },
  label: { display: 'block', fontWeight: '600', color: '#333', fontSize: 14, marginBottom: 6, marginTop: 12 },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, minHeight: 100, resize: 'vertical', boxSizing: 'border-box' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: { padding: '6px 14px', borderRadius: 20, border: '1px solid #ddd', cursor: 'pointer', fontSize: 13, backgroundColor: 'white', color: '#555' },
  chipActivo: { backgroundColor: '#2D6A4F', color: 'white', border: '1px solid #2D6A4F' },
  btnGuardar: { padding: '14px', backgroundColor: '#2D6A4F', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer', fontWeight: 'bold' },
  mensaje: { textAlign: 'center', fontWeight: 'bold', color: '#2D6A4F', fontSize: 15 },
  inputFile: { marginBottom: 16 },
  fotos: { display: 'flex', flexWrap: 'wrap', gap: 12 },
  foto: { width: 150, height: 120, objectFit: 'cover', borderRadius: 8 },
};