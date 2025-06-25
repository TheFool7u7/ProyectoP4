const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabaseClient'); // Se importa el cliente

// POST
router.post('/', async (req, res) => {
    // Los datos del formulario vendrán en req.body
    const graduado = req.body;

    // Se usa el cliente de Supabase para insertar en la tabla 'graduados'
    const { data, error } = await supabase
        .from('graduados')
        .insert([graduado])
        .select();

    if (error) {
        // log para mostrar el mensaje de error directamente
        console.error('Error al insertar en Supabase:', error.message);
        return res.status(500).json({ error: 'Error al registrar el graduado', details: error.message });
    }

    // Si todo sale bien, se devuelve los datos insertados
    res.status(201).json({ message: 'Graduado registrado con éxito', data: data });
});

//GET
router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('graduados')
        .select(`
            *,
            perfiles (
                rol
            )
        `);

    if (error) {
        console.error('Error al obtener de Supabase:', error.message);
        return res.status(500).json({ error: 'Error al obtener los graduados' });
    }

    // se le da formato a la data para que sea más fácil de usar en el frontend
    const aplanada = data.map(g => ({
        ...g,
        rol: g.perfiles?.rol // Mueve el rol al nivel principal del objeto
    }));

    res.status(200).json(aplanada);
});

// DELETE
router.delete('/:id', async (req, res) => {
    const { id } = req.params; // Se obtiene el ID de los parámetros de la URL

    const { error } = await supabase
        .from('graduados')
        .delete()
        .eq('id', id); // Borra la fila donde el 'id' coincida

    if (error) {
        console.error('Error al borrar de Supabase:', error.message);
        return res.status(500).json({ error: 'Error al eliminar el graduado', details: error.message });
    }

    res.status(200).json({ message: 'Graduado eliminado con éxito' });
});

// PUT
router.put('/:id', async (req, res) => {
    const { id } = req.params; // ID del graduado a actualizar
    const updatedData = req.body; // Los nuevos datos del formulario

    const { data, error } = await supabase
        .from('graduados')
        .update(updatedData)
        .eq('id', id)
        .select(); // .select() para que devuelva el registro actualizado

    if (error) {
        console.error('Error al actualizar en Supabase:', error.message);
        return res.status(500).json({ error: 'Error al actualizar el graduado', details: error.message });
    }

    if (data.length === 0) {
        return res.status(404).json({ error: 'No se encontró el graduado para actualizar' });
    }

    res.status(200).json({ message: 'Graduado actualizado con éxito', data: data[0] });
});

// POST para creación de usuario por admin
router.post('/admin-create', async (req, res) => {
    const {
        email,
        password,
        nombre_completo,
        identificacion,
    } = req.body;

    // se crea el usuario en el sistema de Auth de Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // se marca el email como confirmado inmediatamente
        user_metadata: {
            nombre_completo: nombre_completo,
            identificacion: identificacion
        }
    });

    if (authError) {
        console.error("Error al crear usuario de Auth:", authError);
        return res.status(500).json({ error: "Error al crear el usuario en el sistema de autenticación.", details: authError.message });
    }

    // Si el usuario de Auth se creó, el trigger 'handle_new_user' que ya se
    // debería haberse disparado y creado los registros en 'perfiles' y 'graduados'.

    // se devuelve el usuario recién creado como confirmación.
    res.status(201).json({ message: 'Graduado y usuario creados con éxito', data: authData.user });
});

// GET 
// Obtiene todas las carreras de un graduado específico.
router.get('/:id/carreras', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('graduado_carreras')
        .select('*')
        .eq('graduado_id', id)
        .order('ano_finalizacion', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
});

// POST 
// Añade una nueva carrera a un graduado.
router.post('/carreras', async (req, res) => {
    const { data, error } = await supabase
        .from('graduado_carreras')
        .insert([req.body])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
});

// DELETE 
// Elimina una carrera específica por su ID.
router.delete('/carreras/:carreraId', async (req, res) => {
    const { carreraId } = req.params;
    const { error } = await supabase
        .from('graduado_carreras')
        .delete()
        .eq('id', carreraId);

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ message: 'Carrera eliminada exitosamente' });
});

// POST 
// Crea un usuario, perfil, graduado y sus carreras desde cero (para administradores) 2.0.
router.post('/admin-create', async (req, res) => {
    const {
        email,
        password,
        nombre_completo,
        identificacion,
        telefono,
        direccion,
        zona_geografica,
        logros_adicionales,
        carreras // Lista de carreras
    } = req.body;

    if (!email || !password || !nombre_completo || !identificacion || !carreras || carreras.length === 0) {
        return res.status(400).json({ error: 'Faltan datos requeridos. Asegúrese de incluir email, contraseña, nombre, identificación y al menos una carrera.' });
    }

    // 1. Crear el usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
    });

    if (authError) {
        console.error("Error al crear usuario de Auth:", authError);
        return res.status(500).json({ error: "Error al crear el usuario.", details: authError.message });
    }

    const newUserId = authData.user.id;

    // 2. Crear el registro en 'perfiles' (manejado por trigger, pero verificamos/insertamos por seguridad)
    // El trigger 'handle_new_user' debería haber creado este perfil.
    // Si no, lo creamos manualmente.
    const { error: perfilError } = await supabase
        .from('perfiles')
        .upsert({ id: newUserId, nombre_completo: nombre_completo, rol: 'graduado_usuario' });
    
    if (perfilError) {
        await supabase.auth.admin.deleteUser(newUserId); // Cleanup
        return res.status(500).json({ error: 'Error al asegurar el perfil del usuario.', details: perfilError.message });
    }

    // 3. Crear el registro en 'graduados'
    const { data: graduadoData, error: graduadoError } = await supabase
        .from('graduados')
        .insert({
            perfil_id: newUserId,
            nombre_completo,
            identificacion,
            correo_electronico: email,
            telefono,
            direccion,
            zona_geografica,
            logros_adicionales
        })
        .select()
        .single();
    
    if (graduadoError) {
        await supabase.auth.admin.deleteUser(newUserId); 
        return res.status(500).json({ error: 'Error al registrar los datos del graduado.', details: graduadoError.message });
    }
    
    const nuevoGraduadoId = graduadoData.id;

    // 4. Insertar las carreras asociadas
    const carrerasParaInsertar = carreras.map(carrera => ({
        graduado_id: nuevoGraduadoId,
        nombre_carrera: carrera.nombre_carrera,
        ano_finalizacion: carrera.ano_finalizacion
    }));

    const { error: carrerasError } = await supabase
        .from('graduado_carreras')
        .insert(carrerasParaInsertar);

    if (carrerasError) {
        // En este punto, el usuario está creado pero las carreras no.
        // Se podría borrar todo para consistencia, pero por ahora se notifica.
        return res.status(500).json({ error: 'Usuario creado, pero hubo un error al registrar las carreras.', details: carrerasError.message });
    }

    res.status(201).json({ message: 'Graduado y usuario creados con éxito', data: authData.user });
});

module.exports = router;