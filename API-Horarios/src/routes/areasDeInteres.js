const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabaseClient');

// GET
router.get('/', async (req, res) => {
    const { data, error } = await supabase.from('areas_interes').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
});

// POST
router.post('/', async (req, res) => {
    const { nombre_area, descripcion } = req.body;
    const { data, error } = await supabase
        .from('areas_interes')
        .insert([{ nombre_area, descripcion }])
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
});

// PUT
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre_area, descripcion } = req.body;
    const { data, error } = await supabase
        .from('areas_interes')
        .update({ nombre_area, descripcion })
        .eq('id', id)
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data[0]);
});

// DELETE
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('areas_interes').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ message: 'Área de interés eliminada con éxito' });
});

module.exports = router;