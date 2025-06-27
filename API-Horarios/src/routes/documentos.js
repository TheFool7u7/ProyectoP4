const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabaseClient');

// GET
router.get('/:graduadoId', async (req, res) => {
    const { graduadoId } = req.params;
    const { data, error } = await supabase
        .from('documentos_graduados') // <-- ¡CORREGIDO! Nombre de la tabla de la DB
        .select('*')
        .eq('graduado_id', graduadoId);

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
});

// POST (Esta ruta ya estaba corregida y es correcta)
router.post('/', async (req, res) => {
    // El body contiene: { graduado_id, tipo_documento, nombre_archivo, url_archivo_storage }
    const { data, error } = await supabase
        .from('documentos_graduados') 
        .insert([req.body])
        .select();

    if (error) {
        console.error("Error al insertar documento en la tabla 'documentos_graduados':", error.message);
        return res.status(500).json({ error: 'Error al guardar la referencia del documento en la base de datos.', details: error.message });
    }
    res.status(201).json(data[0]);
});

// DELETE 
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Obtener la URL del documento que vamos a borrar.
        const { data: docData, error: findError } = await supabase
            .from('documentos_graduados') // <-- ¡CORREGIDO! Nombre de la tabla de la DB
            .select('url_archivo_storage')
            .eq('id', id)
            .single();

        if (findError || !docData) {
            return res.status(404).json({ error: 'Registro de documento no encontrado.' });
        }

        const url = docData.url_archivo_storage;
        // Extraemos solo el nombre del archivo de la URL. Este método es seguro.
        const filePath = url.substring(url.lastIndexOf('/') + 1);
        
        // 2. Eliminar el archivo del Storage.
        // Aquí SÍ se usa el nombre del bucket de Storage (con guion medio), lo cual es correcto.
        const { error: storageError } = await supabase.storage
            .from('documentos-graduados') 
            .remove([filePath]);

        if (storageError) {
            console.warn(`Advertencia al borrar de Storage: ${storageError.message}. Se continuará borrando el registro de la base de datos.`);
        }
        
        // 3. Eliminar el registro de la base de datos.
        const { error: dbError } = await supabase
            .from('documentos_graduados') // <-- ¡CORREGIDO! Nombre de la tabla de la DB
            .delete()
            .eq('id', id);

        if (dbError) {
            throw new Error(dbError.message);
        }

        res.status(200).json({ message: 'Documento eliminado con éxito.' });
    
    } catch (error) {
        console.error("Error completo al eliminar documento:", error);
        res.status(500).json({ error: "Error inesperado en el servidor.", details: error.message });
    }
});

module.exports = router;