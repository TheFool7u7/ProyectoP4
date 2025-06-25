const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabaseClient');

// GET 
router.get('/:graduadoId', async (req, res) => {
    const { graduadoId } = req.params; // Este ID es en realidad el perfil_id del usuario

    // 1. Se empieza la consulta desde la tabla 'graduados'
    const { data, error } = await supabase
        .from('graduados')
        .select(`
            id,
            nombre_completo,
            graduados_talleres (
                id,
                taller_id,
                estado,
                url_certificado_storage,
                talleres (
                    nombre,
                    fecha_inicio,
                    descripcion,
                    modalidad
                )
            )
        `)
        .eq('perfil_id', graduadoId)
        .single(); // Se usa .single() porque solo debe haber un graduado por perfil

    if (error) {
        console.error("Error al obtener inscripciones (nueva forma):", error);
        return res.status(500).json({ error: 'Error al procesar la solicitud de inscripciones.' });
    }

    // 2. La respuesta de Supabase es un objeto de graduado que CONTIENE la lista de talleres.
    // se debe extraer esa lista para enviarla al frontend, que espera un array.
    const inscripciones = data ? data.graduados_talleres : [];
    res.status(200).json(inscripciones);
});

//POST
router.post('/', async (req, res) => {
    const { graduado_id, taller_id } = req.body;

    if (!graduado_id || !taller_id) {
        return res.status(400).json({ error: 'Faltan datos para la inscripción.' });
    }

    const { data: existente, error: findError } = await supabase
        .from('graduados_talleres')
        .select('id')
        .eq('graduado_id', graduado_id)
        .eq('taller_id', taller_id)
        .single();

    if (existente) {
        return res.status(409).json({ error: 'Ya estás inscrito en este taller.' });
    }

    const { data, error } = await supabase
        .from('graduados_talleres')
        .insert([{ graduado_id, taller_id, estado: 'inscrito' }])
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: '¡Inscripción exitosa!', data: data[0] });
});

//DELETE
router.delete('/:id', async (req, res) => {
    const { id } = req.params; // Se obtiene el ID de la inscripción desde la URL

    if (!id) {
        return res.status(400).json({ error: 'Se requiere el ID de la inscripción.' });
    }

    const { error } = await supabase
        .from('graduados_talleres')
        .delete()
        .eq('id', id); // Se elimina la fila que coincide con ese ID

    if (error) {
        console.error("Error al anular inscripción:", error);
        return res.status(500).json({ error: 'Error al procesar la anulación.' });
    }

    res.status(200).json({ message: 'Inscripción anulada exitosamente.' });
});

//PUT
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
        return res.status(400).json({ error: 'El nuevo estado es requerido.' });
    }

    const { data, error } = await supabase
        .from('graduados_talleres')
        .update({ estado: estado })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: 'Error al actualizar la inscripción.' });
    }

    res.status(200).json(data);
});

//PATCH
router.patch('/:id/certificado', async (req, res) => {

    const { id } = req.params; // ID de la inscripción

    const { url_certificado_storage, fecha_emision_certificado } = req.body;

    if (!url_certificado_storage || !fecha_emision_certificado) {
        return res.status(400).json({ error: 'Faltan datos del certificado.' });
    }

    const { data, error } = await supabase
        .from('graduados_talleres')
        .update({
            url_certificado_storage: url_certificado_storage,
            fecha_emision_certificado: fecha_emision_certificado,
            estado: 'completado_certificado' // Actualiza también el estado
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error("Error al guardar certificado en DB:", error);
        return res.status(500).json({ error: 'Error al guardar el certificado.' });
    }

    res.status(200).json(data);
});


module.exports = router;