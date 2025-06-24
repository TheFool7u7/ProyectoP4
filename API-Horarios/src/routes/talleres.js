const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabaseClient');

// GET
router.get('/', async (req, res) => {
    const { data, error } = await supabase.from('talleres').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
});

// GET
router.get('/:id/areas', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('talleres_areas_interes')
        .select('area_interes_id')
        .eq('taller_id', id);
    
    if (error) return res.status(500).json({ error: error.message });

    // Se devuelve solo un array de IDs para que sea fácil de usar en el frontend
    const areaIds = data.map(item => item.area_interes_id);
    res.status(200).json(areaIds);
});


// POST
router.post('/', async (req, res) => {
    // Se separan los IDs de las áreas del resto de los datos del taller
    const { areas_ids, ...tallerData } = req.body;

    // 1. Se Inserta el taller en la tabla 'talleres'
    const { data: tallerResult, error: tallerError } = await supabase
        .from('talleres')
        .insert([tallerData])
        .select()
        .single(); // .single() para obtener el objeto directamente, no un array

    if (tallerError) {
        console.error("Error al crear taller:", tallerError);
        return res.status(500).json({ error: tallerError.message });
    }

    // 2. Si se proporcionaron IDs de áreas, se asocian en la tabla intermedia
    if (areas_ids && areas_ids.length > 0) {
        const relaciones = areas_ids.map(area_id => ({
            taller_id: tallerResult.id,
            area_interes_id: area_id,
        }));

        const { error: areasError } = await supabase
            .from('talleres_areas_interes')
            .insert(relaciones);

        if (areasError) {
            console.error("Error al asociar áreas:", areasError);
            // Idealmente, aquí se podría implementar una transacción o borrar el taller recién creado para mantener la consistencia de los datos.
            // Depues lo hago no es necesario, actualmente
            return res.status(500).json({ error: 'Taller creado, pero falló la asociación de áreas.' });
        }
    }

    // Si todo salió bien, se devuelve el taller recién creado
    res.status(201).json(tallerResult);
});

// PUT
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { areas_ids, ...tallerData } = req.body;

    // 1. Se actualizan los datos principales del taller
    const { data: tallerResult, error: tallerError } = await supabase
        .from('talleres')
        .update(tallerData)
        .eq('id', id)
        .select()
        .single();
    
    if (tallerError) return res.status(500).json({ error: tallerError.message });

    // 2. Se borran todas las asociaciones de áreas de interés antiguas para este taller
    // Esta es una estrategia común "borrar y re-escribir"
    const { error: deleteError } = await supabase
        .from('talleres_areas_interes')
        .delete()
        .eq('taller_id', id);
    
    if (deleteError) return res.status(500).json({ error: 'Taller actualizado, pero falló la limpieza de áreas antiguas.' });

    // 3. Si se enviaron nuevos IDs de áreas, se insertan
    if (areas_ids && areas_ids.length > 0) {
        const nuevasRelaciones = areas_ids.map(area_id => ({
            taller_id: id,
            area_interes_id: area_id,
        }));
        
        const { error: insertError } = await supabase
            .from('talleres_areas_interes')
            .insert(nuevasRelaciones);

        if (insertError) return res.status(500).json({ error: 'Taller actualizado, pero falló la nueva asociación de áreas.' });
    }
    
    res.status(200).json(tallerResult);
});


// DELETE
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('talleres').delete().eq('id', id);
    if (error) {
        console.error("Error al eliminar taller:", error);
        return res.status(500).json({ error: error.message });
    }
    res.status(200).json({ message: 'Taller eliminado con éxito' });
});

module.exports = router;