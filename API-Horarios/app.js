// API-Horarios/app.js
const express = require('express');
const cors = require('cors');

// Carga las variables de entorno desde el archivo .env
// que está en el mismo directorio que este app.js
require('dotenv').config(); // <--- ESTA ES LA LÍNEA CORRECTA Y ÚNICA PARA DOTENV

const app = express();
const port = process.env.API_PORT || 3001;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5175'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`El origen ${origin} no está permitido por CORS.`));
    }
  },
}));

// Importar rutas
// Las rutas a los archivos de rutas son relativas a la ubicación de app.js
const loginRoutes = require("./src/routes/login");
const graduadosRoutes = require("./src/routes/graduados");
const { verifyToken } = require('./auth'); // auth.js está al mismo nivel que app.js

// Ruta base de prueba
app.get("/api", function(req, res) {
  res.status(200).send('SERVIDOR SISTEMA DE GRADUADOS FUNCIONANDO CORRECTAMENTE');
});

// Usar las rutas
app.use("/api/login", loginRoutes);
app.use("/api/graduados", graduadosRoutes); // Ya lo tenías, asegúrate que las rutas internas en graduados.js estén protegidas con verifyToken

// Manejador de errores básico
app.use((err, req, res, next) => {
  console.error("Ha ocurrido un error:", err.stack || err.message || err);
  if (err.message && err.message.includes('no está permitido por CORS')) {
    return res.status(403).json({ message: err.message });
  }
  res.status(500).json({ message: 'Ha ocurrido un error interno en el servidor.' });
});

app.listen(port, () => {
  console.log(`Servidor API escuchando en http://localhost:${port}`);
  // Para verificar que las variables se cargaron (opcional, puedes borrar después)
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Cargada' : 'NO CARGADA');
  console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Cargada' : 'NO CARGADA');
  console.log('API_PORT:', process.env.API_PORT ? 'Cargada' : 'NO CARGADA');
  console.log('JWT_API_SECRET:', process.env.JWT_API_SECRET ? 'Cargada' : 'NO CARGADA');
});