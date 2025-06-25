const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabaseClient');

// GET 
router.get('/facilitadores', async (req, res) => {
    const { data, error } = await supabase
        .from('perfiles')
        .select('id, nombre_completo')
        .in('rol', ['facilitador', 'administrador']); // Se filtra por rol

    if (error) {
        return res.status(500).json({ error: 'Error al obtener la lista de facilitadores.' });
    }
    res.status(200).json(data);
});

module.exports = router;