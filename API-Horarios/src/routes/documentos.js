const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabaseClient');

// GET
router.get('/:graduadoId', async (req, res) => {
    const { graduadoId } = req.params;
    const { data, error } = await supabase
        .from('documentos_graduados')
        .select('*')
        .eq('graduado_id', graduadoId);

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
});

// POST
router.post('/', async (req, res) => {
    // El body contiene: { graduado_id, tipo_documento, nombre_archivo, url_archivo_storage }
    const { data, error } = await supabase
        .from('documentos_graduados')
        .insert([req.body])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
});

// DELETE 
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // --- Paso 1: Obtener la URL del documento desde la base de datos ---
        const { data: docData, error: findError } = await supabase
            .from('documentos_graduados')
            .select('url_archivo_storage')
            .eq('id', id)
            .single();

        if (findError || !docData) {
            return res.status(404).json({ error: 'Registro de documento no encontrado.' });
        }

        // Se extrae solo el nombre del archivo de la URL completa.
        const url = docData.url_archivo_storage;
        const filePath = url.substring(url.lastIndexOf('/') + 1);
        
        console.log(`Intentando eliminar el archivo: "${filePath}" del bucket.`);

        // --- Paso 2: Eliminar el archivo del Storage usando solo su ruta/nombre ---
        const { error: storageError } = await supabase.storage
            .from('documentos-graduados') // Asegúrate que 'documentos-graduados' es el nombre exacto del bucket
            .remove([filePath]);

        if (storageError) {
            // Este warning es útil si el archivo ya no existe en el storage pero sí en la DB.
            console.warn("Advertencia de Storage:", storageError.message);
        }
        
        // --- Paso 3: Eliminar el registro de la base de datos ---
        const { error: dbError } = await supabase
            .from('documentos_graduados')
            .delete()
            .eq('id', id);

        if (dbError) {
            return res.status(500).json({ error: 'Error al eliminar el registro del documento.', details: dbError.message });
        }

        res.status(200).json({ message: 'Documento eliminado con éxito.' });
    
    } catch (error) {
        res.status(500).json({ error: "Error inesperado en el servidor.", details: error.message });
    }
});
module.exports = router;