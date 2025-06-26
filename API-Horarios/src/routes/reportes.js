// En ProyectoP4/API-Horarios/src/routes/reportes.js (NUEVO ARCHIVO)

const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabaseClient');

// Middleware para verificar si el usuario es administrador
const checkAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];
        const { data: { user } } = await supabase.auth.getUser(token);
        if (!user) return res.status(401).json({ error: 'Invalid token' });

        const { data: perfil } = await supabase
            .from('perfiles')
            .select('rol')
            .eq('id', user.id)
            .single();

        if (perfil && perfil.rol === 'administrador') {
            next();
        } else {
            return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error de autenticación.' });
    }
};

// --- INICIO DE RUTAS DE REPORTES ---

router.use(checkAdmin);

// Reporte 1: Conteo de graduados por carrera (existente)
router.get('/graduados-por-carrera', async (req, res) => {
    const { data, error } = await supabase.rpc('contar_graduados_por_carrera');
    if (error) return res.status(500).json({ error: 'Error al generar el reporte.' });
    res.status(200).json(data);
});


// Reporte 2: Conteo de graduados por año
router.get('/graduados-por-ano', async (req, res) => {
    const { data, error } = await supabase.rpc('contar_graduados_por_ano');
    if (error) return res.status(500).json({ error: 'Error al generar el reporte.' });
    res.status(200).json(data);
});

// Reporte 3: Conteo de graduados por zona geográfica
router.get('/graduados-por-zona', async (req, res) => {
    const { data, error } = await supabase.rpc('contar_graduados_por_zona');
    if (error) return res.status(500).json({ error: 'Error al generar el reporte.' });
    res.status(200).json(data);
});

// Reporte 4: Conteo de inscripciones por taller
router.get('/inscripciones-por-taller', async (req, res) => {
    const { data, error } = await supabase.rpc('contar_inscripciones_por_taller');
    if (error) return res.status(500).json({ error: 'Error al generar el reporte.' });
    res.status(200).json(data);
});

// Reporte de Preferencias por Área de Interés
router.get('/preferencias-areas', async (req, res) => {
    const { data, error } = await supabase.rpc('contar_preferencias_areas_interes');
    if (error) return res.status(500).json({ error: 'Error al generar el reporte de preferencias.' });
    res.status(200).json(data);
});

// Reporte de Análisis de Talleres
router.get('/analisis-talleres', async (req, res) => {
    const { data, error } = await supabase.rpc('analizar_tasas_talleres');
    if (error) return res.status(500).json({ error: 'Error al generar el análisis de talleres.' });
    res.status(200).json(data);
});

router.get('/resumen-kpis', async (req, res) => {
    const { data, error } = await supabase.rpc('resumen_plataforma_kpis').single();
    if (error) return res.status(500).json({ error: 'Error al generar los KPIs.' });
    res.status(200).json(data);
});

router.get('/crecimiento-mensual', async (req, res) => {
    const { data, error } = await supabase.rpc('reporte_crecimiento_mensual');
    if (error) return res.status(500).json({ error: 'Error al generar el reporte de crecimiento.' });
    res.status(200).json(data);
});

router.get('/desempeno-facilitadores', async (req, res) => {
    const { data, error } = await supabase.rpc('analisis_desempeno_facilitadores');
    if (error) return res.status(500).json({ error: 'Error al generar el análisis de facilitadores.' });
    res.status(200).json(data);
});

module.exports = router;