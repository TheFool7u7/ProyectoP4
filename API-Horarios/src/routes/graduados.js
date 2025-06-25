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



module.exports = router;