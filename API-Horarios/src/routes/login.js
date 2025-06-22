const express = require('express');
const router = express.Router();
const { generateToken } = require('../../auth');
const { supabase } = require('../config/supabaseClient');

router.post('/', async (req, res) => {
  const { id: identificacion, password } = req.body;

  // Por ahora, solo se valida la identificación.
  const { data: graduado, error } = await supabase
    .from('graduados')
    .select('*')
    .eq('identificacion', identificacion)
    .single(); // .single() para obtener un solo objeto en lugar de un array

  if (error || !graduado) {
    return res.status(401).json({ error: 'Credenciales inválidas o graduado no encontrado' });
  }

  // Si se encuentra al graduado, se genera el token
  const token = generateToken(graduado);
  
  //Se devuelve el token Y el perfil del graduado
  res.json({ token, perfil: graduado });
});

module.exports = router;