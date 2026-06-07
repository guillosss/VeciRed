const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Leer .env manualmente (evita interferencia de dotenvx)
const envPath = path.join(__dirname, 'src', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && key.trim()) process.env[key.trim()] = vals.join('=').trim();
});

const authRoutes = require('./src/routes/auth.routes');
const perfilRoutes = require('./src/routes/perfil.routes');
const adminRoutes = require('./src/routes/admin.routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/perfiles', perfilRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'VeciRed API corriendo' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});