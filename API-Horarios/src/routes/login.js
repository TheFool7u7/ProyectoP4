const express = require('express');
const router = express.Router();
const { generateToken } = require('../../auth');



// Mock de usuario

router.post('/', (req, res) => {
  if (req.body.id == 110990099 && req.body.password == '123456'){
  const token = generateToken(req.body);
  res.json({ token });
  }
});


module.exports = router;
