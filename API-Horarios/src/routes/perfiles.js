const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabaseClient');

// PUT /api/perfiles/:id
// Actualiza un perfil de usuario. Puede actualizar solo el rol o más datos.
router.put('/:id', async (req, res) => {
    const { id } = req.params; // El ID del perfil que queremos cambiar
    const { rol } = req.body; // El nuevo rol que viene desde el frontend

    // --- Validación ---
    // Nos aseguramos de que el rol sea uno de los valores permitidos
    if (rol && !['administrador', 'facilitador', 'graduado_usuario'].includes(rol)) {
        return res.status(400).json({ error: 'El rol proporcionado no es válido.' });
    }

    // --- Lógica de la Base de Datos ---
    try {
        const { data, error } = await supabase
            .from('perfiles')
            .update({ rol: rol }) // Actualizamos el campo 'rol' con el nuevo valor
            .eq('id', id)         // Solamente en la fila donde el 'id' coincida
            .select()             // Devolvemos el registro actualizado para confirmar
            .single();

        // Si Supabase devuelve un error
        if (error) {
            console.error("Error al actualizar perfil en Supabase:", error);
            return res.status(500).json({ error: 'Error al actualizar el rol.', details: error.message });
        }
        
        // Si todo sale bien
        res.status(200).json({ message: 'Rol actualizado con éxito.', data: data });

    } catch (serverError) {
        console.error("Error inesperado del servidor:", serverError);
        res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor.' });
    }
});


module.exports = router;