const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabaseClient');

// GET 
router.get('/talleres', async (req, res) => {
    const { data, error } = await supabase
        .from('talleres')
        .select('*')
        .eq('publicado', true) // Se filtra para obtener solo los que están marcados como publicados
        .eq('cancelado', false); // Y que no estén cancelados

    if (error) {
        console.error("Error al obtener catálogo:", error);
        return res.status(500).json({ error: error.message });
    }
    
    res.status(200).json(data);
});

//GET unico
router.get('/talleres/:id', async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('talleres')
        .select('*')
        .eq('id', id)
        .single(); // .single() para obtener un solo objeto

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Taller no encontrado' });

    res.status(200).json(data);
});

module.exports = router;