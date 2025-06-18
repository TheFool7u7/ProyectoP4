const express = require('express');
const router = express.Router();
const { generateToken } = require('../../auth'); // Tu función para generar el token de la API
const { createClient } = require('@supabase/supabase-js');

// Inicializamos el cliente de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * @route   POST /api/login
 * @desc    Autentica un usuario contra Supabase y devuelve un token JWT para la API.
 * @access  Public
 */
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  // Validamos que se hayan enviado ambos campos
  if (!email || !password) {
    return res.status(400).json({ message: 'El correo y la contraseña son requeridos.' });
  }

  try {
    // 1. Autenticar contra Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      // Si Supabase devuelve un error (ej. contraseña inválida)
      return res.status(401).json({ message: error.message });
    }

    if (data.user) {
      // 2. Si la autenticación es exitosa, obtenemos el perfil del usuario de nuestra tabla 'perfiles'
      const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .select('id, nombre_completo, rol')
        .eq('id', data.user.id)
        .single();

      if (perfilError || !perfil) {
        return res.status(404).json({ message: 'No se encontró un perfil asociado a este usuario.' });
      }

      // 3. Generamos nuestro propio token JWT para controlar la sesión en nuestra API interna.
      //    Incluimos el rol y el id del perfil para usarlo en futuras peticiones.
      const payload = {
        id: perfil.id,
        rol: perfil.rol
      };
      const apiToken = generateToken(payload); // Tu función que genera el token

      // 4. Enviamos el token de nuestra API y los datos del usuario al frontend.
      res.json({
        message: 'Login exitoso',
        token: apiToken,
        user: {
          id: perfil.id,
          nombre_completo: perfil.nombre_completo,
          email: data.user.email,
          rol: perfil.rol
        }
      });

    } else {
       return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

  } catch (err) {
    console.error('Error en el proceso de login:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

module.exports = router;