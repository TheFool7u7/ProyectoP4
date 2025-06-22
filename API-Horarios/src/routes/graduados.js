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

    // Si todo sale bien, devolvemos los datos insertados
    res.status(201).json({ message: 'Graduado registrado con éxito', data: data });
});

//GET
router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('graduados')
        .select('*'); // Select('*') obtiene todas las columnas de la BD

    if (error) {
        console.error('Error al obtener de Supabase:', error.message);
        return res.status(500).json({ error: 'Error al obtener los graduados', details: error.message });
    }

    res.status(200).json(data); // Se devuelve el array de graduados
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

module.exports = router;