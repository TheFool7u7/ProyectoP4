// API-Horarios/src/auth.js
const jwt = require('jsonwebtoken');
// NO cargues dotenv aquí si lo vas a cargar en app.js
// require('dotenv').config(); // Se cargará en app.js

const JWT_API_SECRET = process.env.JWT_API_SECRET; // Usaremos esta variable de entorno

if (!JWT_API_SECRET) {
  console.error("ALERTA CRÍTICA: JWT_API_SECRET no está definida en las variables de entorno.");
  // En un entorno de producción, podrías querer que la aplicación no inicie:
  // process.exit(1);
}

// Generar un token (payload ya lo defines en tu ruta /api/login)
function generateToken(payload) {
  if (!JWT_API_SECRET) {
    console.error("Error: No se puede generar token sin JWT_API_SECRET.");
    throw new Error("Configuración de servidor incompleta para generar token.");
  }
  return jwt.sign(payload, JWT_API_SECRET, { expiresIn: '1d' }); // Token válido por 1 día
}

// Verificar el token
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // El token debe venir como "Bearer TU_TOKEN_AQUI"
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token == null) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' }); // 401 Unauthorized
  }

  if (!JWT_API_SECRET) {
    console.error("Error: No se puede verificar token sin JWT_API_SECRET.");
    return res.status(500).json({ message: "Error de configuración del servidor al verificar token." });
  }

  jwt.verify(token, JWT_API_SECRET, (err, decodedUser) => { // decodedUser será el payload
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expirado. Por favor, inicie sesión de nuevo.' });
      }
      // Otros errores como JsonWebTokenError (malformado, firma inválida)
      return res.status(403).json({ message: 'Token inválido o corrupto.' }); // 403 Forbidden
    }
    req.user = decodedUser; // Adjunta la info del usuario (payload del token) a la request
    next();
  });
}

module.exports = { generateToken, verifyToken };