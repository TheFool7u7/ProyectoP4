// API-Horarios/src/routes/graduados.js
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { verifyToken } = require('../../auth'); // Asegúrate que la ruta a auth.js sea correcta


// Inicializamos el cliente de Supabase
// Es recomendable centralizar esta inicialización si la usas en múltiples archivos.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- RUTAS CRUD PARA GRADUADOS ---
// Todas las rutas aquí estarán protegidas por verifyToken

/**
 * @route   GET /api/graduados
 * @desc    Obtener todos los graduados
 * @access  Private (requiere token)
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    // req.user estará disponible gracias al middleware verifyToken
    // console.log('Usuario autenticado:', req.user); // Puedes usar req.user.rol para lógica específica

    const { data, error } = await supabase
      .from('graduados')
      .select('*') // Puedes seleccionar columnas específicas: 'id, nombre_completo, correo_electronico, carrera_cursada, ano_graduacion'
      .order('nombre_completo', { ascending: true });

    if (error) {
      console.error('Error Supabase (GET /graduados):', error);
      return res.status(500).json({ message: 'Error al obtener los graduados.', error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error('Error en GET /graduados:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

/**
 * @route   GET /api/graduados/:id
 * @desc    Obtener un graduado por su ID
 * @access  Private
 */
router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('graduados')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Código de Supabase para "no rows returned" con .single()
        return res.status(404).json({ message: 'Graduado no encontrado.' });
      }
      console.error('Error Supabase (GET /graduados/:id):', error);
      return res.status(500).json({ message: 'Error al obtener el graduado.', error: error.message });
    }
    if (!data) {
        return res.status(404).json({ message: 'Graduado no encontrado.' });
    }
    res.json(data);
  } catch (err) {
    console.error('Error en GET /graduados/:id:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});


/**
 * @route   POST /api/graduados
 * @desc    Crear un nuevo graduado
 * @access  Private (requiere token, idealmente solo administradores/facilitadores)
 */
router.post('/', verifyToken, async (req, res) => {
  // Opcional: Verificar rol del usuario si solo ciertos roles pueden crear
  // if (req.user.rol !== 'administrador' && req.user.rol !== 'facilitador') {
  //   return res.status(403).json({ message: 'Acceso denegado: No tienes permiso para crear graduados.' });
  // }

  const {
    nombre_completo,
    identificacion,
    correo_electronico,
    carrera_cursada,
    ano_graduacion,
    telefono, // Opcional
    direccion, // Opcional
    zona_geografica, // Opcional
    evento_graduacion_id, // Opcional
    logros_adicionales // Opcional
    // perfil_id no se suele enviar directamente, se manejaría en un proceso de creación de usuario + perfil
  } = req.body;

  // Validación básica de campos requeridos
  if (!nombre_completo || !identificacion || !correo_electronico || !carrera_cursada || !ano_graduacion) {
    return res.status(400).json({ message: 'Los campos nombre_completo, identificacion, correo_electronico, carrera_cursada y ano_graduacion son requeridos.' });
  }

  try {
    const { data, error } = await supabase
      .from('graduados')
      .insert([{
        nombre_completo,
        identificacion,
        correo_electronico,
        carrera_cursada,
        ano_graduacion: parseInt(ano_graduacion), // Asegurarse que sea número
        telefono,
        direccion,
        zona_geografica,
        evento_graduacion_id: evento_graduacion_id || null, // Si es undefined, enviar null
        logros_adicionales
      }])
      .select() // Para que devuelva el objeto creado
      .single(); // Asumimos que insertamos uno a la vez

    if (error) {
      console.error('Error Supabase (POST /graduados):', error);
      // Manejar errores específicos, ej. violación de constraint UNIQUE
      if (error.code === '23505') { // Código para violación de unique constraint
        return res.status(409).json({ message: 'Error al crear el graduado: La identificación o el correo electrónico ya existen.', details: error.details });
      }
      return res.status(500).json({ message: 'Error al crear el graduado.', error: error.message });
    }

    res.status(201).json({ message: 'Graduado creado exitosamente.', graduado: data });
  } catch (err) {
    console.error('Error en POST /graduados:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

/**
 * @route   PUT /api/graduados/:id
 * @desc    Actualizar un graduado existente
 * @access  Private (requiere token, idealmente solo administradores/facilitadores)
 */
router.put('/:id', verifyToken, async (req, res) => {
  // if (req.user.rol !== 'administrador' && req.user.rol !== 'facilitador') {
  //   return res.status(403).json({ message: 'Acceso denegado.' });
  // }
  const { id } = req.params;
  const updates = req.body; // Campos a actualizar

  // No permitir actualizar el ID o campos sensibles directamente así
  delete updates.id;
  delete updates.perfil_id; // El perfil_id se manejaría con otra lógica si es necesario

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No se proporcionaron datos para actualizar.' });
  }
  if (updates.ano_graduacion) {
    updates.ano_graduacion = parseInt(updates.ano_graduacion);
  }


  try {
    const { data, error } = await supabase
      .from('graduados')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error Supabase (PUT /graduados/:id):', error);
       if (error.code === 'PGRST116') { // No encontró el registro para actualizar
        return res.status(404).json({ message: 'Graduado no encontrado para actualizar.' });
      }
      if (error.code === '23505') {
        return res.status(409).json({ message: 'Error al actualizar: La identificación o el correo electrónico ya existen para otro graduado.', details: error.details });
      }
      return res.status(500).json({ message: 'Error al actualizar el graduado.', error: error.message });
    }
    if (!data) { // Si .single() no devuelve data y no hay error, también es un 404
        return res.status(404).json({ message: 'Graduado no encontrado.' });
    }

    res.json({ message: 'Graduado actualizado exitosamente.', graduado: data });
  } catch (err) {
    console.error('Error en PUT /graduados/:id:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

/**
 * @route   DELETE /api/graduados/:id
 * @desc    Eliminar un graduado
 * @access  Private (requiere token, idealmente solo administradores)
 */
router.delete('/:id', verifyToken, async (req, res) => {
  // if (req.user.rol !== 'administrador') {
  //   return res.status(403).json({ message: 'Acceso denegado: Solo administradores pueden eliminar graduados.' });
  // }
  const { id } = req.params;

  try {
    // Primero, verificar si el graduado existe para dar un mensaje 404 más preciso
    const { data: existingGraduado, error: findError } = await supabase
        .from('graduados')
        .select('id')
        .eq('id', id)
        .single();

    if (findError || !existingGraduado) {
        return res.status(404).json({ message: 'Graduado no encontrado para eliminar.' });
    }

    // Si existe, proceder a eliminar
    const { error: deleteError } = await supabase
      .from('graduados')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error Supabase (DELETE /graduados/:id):', deleteError);
      return res.status(500).json({ message: 'Error al eliminar el graduado.', error: deleteError.message });
    }

    res.json({ message: 'Graduado eliminado exitosamente.' });
  } catch (err) {
    console.error('Error en DELETE /graduados/:id:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});


module.exports = router;