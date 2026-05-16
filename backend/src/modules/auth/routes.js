const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { query } = require('../../config/database');
const config   = require('../../config/env');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email y contraseña requeridos' });

    const { rows } = await query('SELECT * FROM usuarios WHERE email=$1 AND activo=true', [email]);
    if (!rows.length)
      return res.status(401).json({ message: 'Credenciales inválidas' });

    const user = rows[0];
    const ok   = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      token,
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
    });
  } catch (err) { next(err); }
});

// GET /api/auth/me
router.get('/me', require('../../middlewares/auth'), (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
