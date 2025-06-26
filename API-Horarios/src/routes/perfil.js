const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabaseClient');

// Ruta para obtener los IDs de los talleres en los que está inscrito el usuario actual
router.get('/mis-inscripciones', async (req, res) => {
    // El ID del usuario logueado se obtiene automáticamente del token de Supabase
    const { data: { user } } = await supabase.auth.getUser(req.headers.authorization.split(' ')[1]);

    if (!user) {
        return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    try {
        // 1. Encontrar el 'graduado_id' correspondiente al 'perfil_id' del usuario
        const { data: graduadoData, error: graduadoError } = await supabase
            .from('graduados')
            .select('id')
            .eq('perfil_id', user.id)
            .single();

        if (graduadoError || !graduadoData) {
            // Si el usuario no tiene un registro de graduado, no tiene inscripciones.
            return res.status(200).json([]); 
        }

        const graduadoId = graduadoData.id;

        // 2. Buscar todas las inscripciones (y los IDs de taller) para ese 'graduado_id'
        const { data: inscripciones, error: inscripcionesError } = await supabase
            .from('graduados_talleres')
            .select('taller_id')
            .eq('graduado_id', graduadoId);

        if (inscripcionesError) {
            throw inscripcionesError;
        }
        
        // 3. Devolver un array simple con los IDs de los talleres
        const idsDeTalleresInscritos = inscripciones.map(inscripcion => inscripcion.taller_id);
        res.status(200).json(idsDeTalleresInscritos);

    } catch (error) {
        console.error("Error al obtener inscripciones:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

module.exports = router;