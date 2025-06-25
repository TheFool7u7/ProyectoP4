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
    const { id } = req.params; // ID del registro del documento en la tabla

    // 1. Se obtiene la ruta del archivo para poder borrarlo de Storage
    const { data: docData, error: findError } = await supabase
        .from('documentos_graduados')
        .select('url_archivo_storage') // La columna que tiene el path
        .eq('id', id)
        .single();

    if (findError || !docData) {
        return res.status(404).json({ error: 'Registro de documento no encontrado.' });
    }

    // 2. Se borra el archivo de Supabase Storage
    const { error: storageError } = await supabase.storage
        .from('documentos-graduados') // El nombre del bucket 
        .remove([docData.url_archivo_storage]); // .remove() espera un array de paths

    if (storageError) {
        // Si el archivo no existe en storage pero sí en la DB, no se trata como un error fatal
        // Esto previene errores si el archivo fue borrado manualmente pero el registro en la DB quedó.
        console.warn("Advertencia: No se encontró el archivo en Storage, pero se procederá a borrar el registro de la DB.", storageError.message);
    }
    
    // 3. Se borra el registro de la base de datos
    const { error: dbError } = await supabase
        .from('documentos_graduados')
        .delete()
        .eq('id', id);

    if (dbError) {
        return res.status(500).json({ error: 'Error al eliminar el registro del documento.', details: dbError.message });
    }

    res.status(200).json({ message: 'Documento eliminado con éxito' });
});

module.exports = router;