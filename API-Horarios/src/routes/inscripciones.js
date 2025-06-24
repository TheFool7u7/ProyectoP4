const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabaseClient');

// POST
router.post('/', async (req, res) => {
    const { graduado_id, taller_id } = req.body;

    if (!graduado_id || !taller_id) {
        return res.status(400).json({ error: 'Faltan datos para la inscripción.' });
    }

    // Primero, se verifica si el usuario ya está inscrito
    const { data: existente, error: findError } = await supabase
        .from('graduados_talleres')
        .select('id')
        .eq('graduado_id', graduado_id)
        .eq('taller_id', taller_id)
        .single();
    
    if (existente) {
        return res.status(409).json({ error: 'Ya estás inscrito en este taller.' });
    }
    
    // Si no está inscrito, se procede a insertar
    const { data, error } = await supabase
        .from('graduados_talleres')
        .insert([{ graduado_id, taller_id, estado: 'inscrito' }])
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: '¡Inscripción exitosa!', data: data[0] });
});

module.exports = router;