const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabaseClient');
const { sendEmail } = require('../config/mailer');

// --- POST / ---
// Crea un graduado (versión simple, sin creación de usuario de Auth)
router.post('/', async (req, res) => {
    const graduado = req.body;
    const { data, error } = await supabase.from('graduados').insert([graduado]).select();
    if (error) {
        console.error('Error al insertar en Supabase:', error.message);
        return res.status(500).json({ error: 'Error al registrar el graduado', details: error.message });
    }
    res.status(201).json({ message: 'Graduado registrado con éxito', data: data });
});

// --- GET / ---
// Obtiene todos los graduados con su rol
router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('graduados')
        .select(`*, perfiles(rol)`);

    if (error) {
        console.error('Error al obtener de Supabase:', error.message);
        return res.status(500).json({ error: 'Error al obtener los graduados' });
    }

    const aplanada = data.map(g => ({
        ...g,
        rol: g.perfiles?.rol
    }));
    res.status(200).json(aplanada);
});

// --- PUT /:id ---
// Actualiza los datos de un graduado
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    const { data, error } = await supabase.from('graduados').update(updatedData).eq('id', id).select();
    if (error) {
        console.error('Error al actualizar en Supabase:', error.message);
        return res.status(500).json({ error: 'Error al actualizar el graduado', details: error.message });
    }
    if (data.length === 0) {
        return res.status(404).json({ error: 'No se encontró el graduado para actualizar' });
    }
    res.status(200).json({ message: 'Graduado actualizado con éxito', data: data[0] });
});


// === RUTA DE CREACIÓN DE ADMIN ACTUALIZADA ===
router.post('/admin-create', async (req, res) => {
    const {
        email, password, nombre_completo, identificacion,
        telefono, direccion, zona_geografica, logros_adicionales,
        carreras // Lista de carreras
    } = req.body;

    if (!email || !password || !nombre_completo) {
        return res.status(400).json({ error: 'Faltan datos requeridos (email, contraseña, nombre).' });
    }

    // 1. Crear usuario en Supabase Auth, pasando la identificación en los metadatos.
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
            nombre_completo: nombre_completo,
            identificacion: identificacion, // <-- CORRECCIÓN CLAVE AQUÍ
            rol: 'graduado_usuario'
        }
    });

    if (authError) {
        console.error("Error al crear usuario de Auth:", authError);
        return res.status(500).json({ error: authError.message });
    }

    const newUserId = authData.user.id;

    // 2. ACTUALIZAR/INSERTAR el registro en 'graduados' que el trigger debería haber creado.
    const { data: graduadoData, error: graduadoError } = await supabase
        .from('graduados')
        .upsert({
            perfil_id: newUserId,
            nombre_completo: nombre_completo,
            identificacion: identificacion,
            correo_electronico: email,
            telefono,
            direccion,
            zona_geografica,
            logros_adicionales
        }, { onConflict: 'perfil_id' }) // Si ya existe, lo actualiza.
        .select()
        .single();
    
    if (graduadoError) {
        await supabase.auth.admin.deleteUser(newUserId);
        return res.status(500).json({ error: 'Error al registrar los datos del graduado.', details: graduadoError.message });
    }
    
    // 3. Insertar las carreras.
    if (carreras && carreras.length > 0) {
        const carrerasParaInsertar = carreras.map(c => ({
            graduado_id: graduadoData.id,
            nombre_carrera: c.nombre_carrera,
            ano_finalizacion: c.ano_finalizacion
        }));
        await supabase.from('graduado_carreras').insert(carrerasParaInsertar);
    }
    
    // 4. Enviar correo de bienvenida.
    const mailOptions = {
        from: `"Sistema de Graduados" <${process.env.GMAIL_USER || 'tu_correo@gmail.com'}>`,
        to: email,
        subject: '¡Bienvenido/a al Sistema de Gestión de Graduados!',
        html: `<h2>¡Hola, ${nombre_completo}!</h2><p>Un administrador ha creado una cuenta para ti en nuestro portal.</p><p>Puedes iniciar sesión con las siguientes credenciales:</p><ul><li><strong>Usuario:</strong> ${email}</li><li><strong>Contraseña:</strong> ${password}</li></ul><p>Te recomendamos cambiar tu contraseña después de tu primer inicio de sesión.</p>`,
    };
    sendEmail(mailOptions);

    res.status(201).json({ message: 'Graduado y usuario creados con éxito', data: authData.user });
});

// === RUTA DE ELIMINACIÓN ===
router.delete('/:id', async (req, res) => {
    const { id } = req.params; // ID del registro en la tabla 'graduados'

    const { data: graduado, error: findError } = await supabase
        .from('graduados')
        .select('perfil_id')
        .eq('id', id)
        .single();

    if (findError || !graduado) {
        return res.status(404).json({ error: 'Graduado no encontrado.' });
    }
    
    const perfilId = graduado.perfil_id;
    const { error: authError } = await supabase.auth.admin.deleteUser(perfilId);

    if (authError && authError.message !== 'User not found') {
        console.error("Error al eliminar usuario de Auth:", authError.message);
    }
    
    const { error: dbError } = await supabase.from('graduados').delete().eq('id', id);

    if (dbError) {
        return res.status(500).json({ error: 'Error al eliminar el registro del graduado de la base de datos.', details: dbError.message });
    }

    res.status(200).json({ message: 'Graduado eliminado con éxito de todo el sistema.' });
});


// --- Rutas para manejar las carreras de un graduado ---
router.get('/:id/carreras', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('graduado_carreras').select('*').eq('graduado_id', id).order('ano_finalizacion', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
});

router.post('/carreras', async (req, res) => {
    const { data, error } = await supabase.from('graduado_carreras').insert([req.body]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
});

router.delete('/carreras/:carreraId', async (req, res) => {
    const { carreraId } = req.params;
    const { error } = await supabase.from('graduado_carreras').delete().eq('id', carreraId);
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ message: 'Carrera eliminada exitosamente' });
});


module.exports = router;
