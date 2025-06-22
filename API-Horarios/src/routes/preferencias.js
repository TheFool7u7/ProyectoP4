const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabaseClient');

// GET 
router.get('/:graduadoId', async (req, res) => {
    const { graduadoId } = req.params;

    const { data, error } = await supabase
        .from('graduados_areas_interes')
        .select('area_interes_id')
        .eq('graduado_id', graduadoId);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    // Se devuelve solo un array de IDs para que sea más fácil de manejar en el frontend
    const preferenceIds = data.map(item => item.area_interes_id);
    res.status(200).json(preferenceIds);
});

// POST 
router.post('/:graduadoId', async (req, res) => {
    const { graduadoId } = req.params;
    const { preferenceIds } = req.body; // El frontend enviará un array de IDs

    // 1.Se borran todas las preferencias anteriores de este graduado
    const { error: deleteError } = await supabase
        .from('graduados_areas_interes')
        .delete()
        .eq('graduado_id', graduadoId);

    if (deleteError) {
        return res.status(500).json({ error: `Error al borrar preferencias antiguas: ${deleteError.message}` });
    }

    // 2. Si hay nuevas preferencias, se insertan
    if (preferenceIds && preferenceIds.length > 0) {
        const rowsToInsert = preferenceIds.map(areaId => ({
            graduado_id: graduadoId,
            area_interes_id: areaId,
        }));

        const { error: insertError } = await supabase
            .from('graduados_areas_interes')
            .insert(rowsToInsert);

        if (insertError) {
            return res.status(500).json({ error: `Error al insertar nuevas preferencias: ${insertError.message}` });
        }
    }

    res.status(200).json({ message: 'Preferencias actualizadas con éxito' });
});

module.exports = router;