const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabaseClient');

// GET
router.get('/:tallerId', async (req, res) => {
    const { tallerId } = req.params;

    // Se obtiene todos los registros de la tabla asistencia_dias que correspondan a inscripciones de este taller.
    const { data, error } = await supabase
        .from('asistencia_dias')
        .select(`
            *,
            graduados_talleres!inner(
                taller_id
            )
        `)
        .eq('graduados_talleres.taller_id', tallerId);
    
    if (error) {
        console.error("Error fetching attendance: ", error);
        return res.status(500).json({ error: 'Error al obtener los registros de asistencia.' });
    }

    res.status(200).json(data);
});

// POST
router.post('/', async (req, res) => {
    const { inscripcion_id, fecha_clase, estado } = req.body;

    if (!inscripcion_id || !fecha_clase || !estado) {
        return res.status(400).json({ error: 'Faltan datos para registrar la asistencia.' });
    }

    // se usa .upsert() para que si ya existe un registro para esa persona en esa fecha,
    // lo actualice. Si no existe, lo crea. Esto simplifica mucho la lógica.
    const { data, error } = await supabase
        .from('asistencia_dias')
        .upsert(
            { inscripcion_id, fecha_clase, estado },
            { onConflict: 'inscripcion_id, fecha_clase' }
        )
        .select();

    if (error) {
        console.error("Error upserting attendance: ", error);
        return res.status(500).json({ error: 'Error al guardar el registro de asistencia.' });
    }

    res.status(201).json(data[0]);
});

module.exports = router;