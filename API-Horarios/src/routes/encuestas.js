const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabaseClient');

// Rutas para Encuestas

// GET todas las encuestas con filtro por creador
router.get('/', async (req, res) => {
    // Se añade la capacidad de filtrar por el ID del perfil que creó la encuesta
    const { creada_por_perfil_id } = req.query; 

    let query = supabase.from('encuestas').select('*');

    // Si se proporciona el ID del creador, se aplica el filtro
    if (creada_por_perfil_id) {
        query = query.eq('creada_por_perfil_id', creada_por_perfil_id);
    }

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
});

// GET una encuesta específica por su ID
router.get('/:encuestaId', async (req, res) => {
    const { encuestaId } = req.params;
    const { data, error } = await supabase
        .from('encuestas')
        .select('*')
        .eq('id', encuestaId)
        .single(); // .single() para obtener un objeto, no un array

    if (error) {
        console.error("Error al obtener encuesta única:", error);
        return res.status(404).json({ error: 'Encuesta no encontrada' });
    }
    res.status(200).json(data);
});

// POST para crear una nueva encuesta
router.post('/', async (req, res) => {

    const { taller_id, titulo, descripcion, creada_por_perfil_id, tipo } = req.body;
    const tallerIdFinal = taller_id === '' ? null : taller_id;

    if (!tipo) {
        return res.status(400).json({ error: 'El campo "tipo" de encuesta es obligatorio.' });
    }
    const { data, error } = await supabase
        .from('encuestas')
        .insert([{ 
            taller_id: tallerIdFinal, 
            titulo, 
            descripcion, 
            creada_por_perfil_id,
            tipo
        }])
        .select();

    if (error) {
        console.error("Error al crear encuesta en Supabase:", error);
        return res.status(500).json({ error: error.message });
    }
    res.status(201).json(data[0]);
});

// Rutas para Preguntas de Encuesta 

// GET preguntas de una encuesta específica
router.get('/:encuestaId/preguntas', async (req, res) => {
    const { encuestaId } = req.params;
    const { data, error } = await supabase
        .from('preguntas_encuesta')
        .select('*')
        .eq('encuesta_id', encuestaId)
        .order('orden');
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
});

// POST para añadir una pregunta a una encuesta
router.post('/:encuestaId/preguntas', async (req, res) => {
    const { encuestaId } = req.params;
    const { texto_pregunta, tipo_pregunta, opciones_respuesta, es_obligatoria } = req.body;
    const { data, error } = await supabase
        .from('preguntas_encuesta')
        .insert([{ encuesta_id: encuestaId, texto_pregunta, tipo_pregunta, opciones_respuesta, es_obligatoria }])
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
});


// POST para guardar la respuesta de un graduado
router.post('/respuestas', async (req, res) => {
    const { respuestas, graduado_id, taller_id } = req.body; 
    const respuestasParaInsertar = respuestas.map(r => ({
        pregunta_id: r.pregunta_id,
        graduado_id: graduado_id, // El ID del graduado es el mismo para todo el lote
        taller_id: taller_id,     // El ID del taller también es el mismo
        respuesta_texto: r.respuesta_texto || null,
        respuesta_seleccion: r.respuesta_seleccion || null,
    }));

    const { data, error } = await supabase
        .from('respuestas_encuesta_graduados')
        .insert(respuestasParaInsertar); 

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ message: 'Respuestas guardadas con éxito' });
});


// GET Para obtener las respuestas
router.get('/:encuestaId/respuestas', async (req, res) => {
    const { encuestaId } = req.params;

    // Para obtener las respuestas, primero se necesecita los IDs de las preguntas de esa encuesta
    const { data: preguntas, error: errorPreguntas } = await supabase
        .from('preguntas_encuesta')
        .select('id')
        .eq('encuesta_id', encuestaId);

    if (errorPreguntas) return res.status(500).json({ error: errorPreguntas.message });

    const idsDePreguntas = preguntas.map(p => p.id);

    const { data, error } = await supabase
        .from('respuestas_encuesta_graduados')
        .select('*')
        .in('pregunta_id', idsDePreguntas);
    
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
});

// DELETE una pregunta específica
router.delete('/preguntas/:preguntaId', async (req, res) => {
    const { preguntaId } = req.params;
    const { error } = await supabase
        .from('preguntas_encuesta')
        .delete()
        .eq('id', preguntaId);

    if (error) {
        return res.status(500).json({ error: 'No se pudo eliminar la pregunta.' });
    }
    res.status(200).json({ message: 'Pregunta eliminada con éxito.' });
});


// PUT para actualizar una encuesta existente
router.put('/:encuestaId', async (req, res) => {
    const { encuestaId } = req.params;
    // Se extraen los datos que se pueden actualizar del cuerpo de la petición
    const { titulo, descripcion, tipo, taller_id } = req.body;

    // Se asegura de que taller_id sea null si está vacío
    const tallerIdFinal = taller_id === '' ? null : taller_id;

    const { data, error } = await supabase
        .from('encuestas')
        .update({
            titulo: titulo,
            descripcion: descripcion,
            tipo: tipo,
            taller_id: tallerIdFinal
        })
        .eq('id', encuestaId)
        .select()
        .single();

    if (error) {
        console.error("Error al actualizar encuesta:", error);
        return res.status(500).json({ error: 'Error al actualizar la encuesta.' });
    }

    res.status(200).json(data);
});

// DELETE para eliminar una encuesta
router.delete('/:encuestaId', async (req, res) => {
    const { encuestaId } = req.params;

    const { error } = await supabase
        .from('encuestas')
        .delete()
        .eq('id', encuestaId);

    if (error) {
        console.error("Error al eliminar encuesta:", error);
        return res.status(500).json({ error: 'Error al eliminar la encuesta.' });
    }

    res.status(200).json({ message: 'Encuesta eliminada con éxito.' });
});

module.exports = router;