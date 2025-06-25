const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabaseClient');

// PUT 
router.put('/:id/rol', async (req, res) => {
    const { id } = req.params;
    const { rol } = req.body;

    if (!rol || !['administrador', 'facilitador', 'graduado_usuario'].includes(rol)) {
        return res.status(400).json({ error: 'Rol no válido.' });
    }

    const { data, error } = await supabase
        .from('perfiles')
        .update({ rol: rol })
        .eq('id', id)
        .select();

    if (error) {
        return res.status(500).json({ error: 'Error al actualizar el rol.', details: error.message });
    }

    res.status(200).json({ message: 'Rol actualizado con éxito.', data: data[0] });
});

module.exports = router;