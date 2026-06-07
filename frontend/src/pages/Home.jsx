import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>🏘️ VeciRed</h1>
        <div style={styles.headerRight}>
          {usuario && <span style={styles.bienvenida}>Hola, {usuario.nombre}</span>}
          {usuario?.rol === 'prestador' && (
            <button style={styles.btnSecundario} onClick={() => navigate('/dashboard')}>
              Mi perfil
            </button>
          )}
          {usuario?.rol === 'administrador' && (
            <button style={styles.btnSecundario} onClick={() => navigate('/admin')}>
              Panel admin
            </button>
          )}
          <button style={styles.btnLogout} onClick={handleLogout}>Salir</button>
        </div>
      </div>

      <div style={styles.hero}>
        <h2 style={styles.heroTitle}>Talento de confianza, a la vuelta de tu casa</h2>
        <p style={styles.heroSub}>Encuentra electricistas, plomeros, pintores y más en tu comuna</p>
        <button style={styles.btnPrimario} onClick={() => navigate('/busqueda')}>
          Buscar servicios
        </button>
      </div>

      <div style={styles.categorias}>
        {['Electricidad','Plomería','Pintura','Costura','Carpintería','Jardinería','Cerrajería','Techado'].map(cat => (
          <div key={cat} style={styles.catCard} onClick={() => navigate(`/busqueda?categoria=${cat}`)}>
            <span style={styles.catNombre}>{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#F8F9FA', fontFamily: 'sans-serif' },
  header: { backgroundColor: '#2D6A4F', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { color: 'white', margin: 0, fontSize: 24 },
  headerRight: { display: 'flex', gap: 12, alignItems: 'center' },
  bienvenida: { color: 'white', fontSize: 14 },
  btnSecundario: { padding: '8px 16px', backgroundColor: '#52B788', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' },
  btnLogout: { padding: '8px 16px', backgroundColor: 'transparent', color: 'white', border: '1px solid white', borderRadius: 8, cursor: 'pointer' },
  hero: { textAlign: 'center', padding: '60px 32px', backgroundColor: '#2D6A4F' },
  heroTitle: { color: 'white', fontSize: 32, margin: '0 0 12px' },
  heroSub: { color: '#B7E4C7', fontSize: 18, margin: '0 0 32px' },
  btnPrimario: { padding: '14px 32px', backgroundColor: '#FFB703', color: '#1B1B1B', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 'bold', cursor: 'pointer' },
  categorias: { display: 'flex', flexWrap: 'wrap', gap: 16, padding: 32, justifyContent: 'center' },
  catCard: { backgroundColor: 'white', border: '1px solid #ddd', borderRadius: 12, padding: '20px 28px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'transform 0.2s' },
  catNombre: { fontSize: 16, color: '#2D6A4F', fontWeight: '600' },
};