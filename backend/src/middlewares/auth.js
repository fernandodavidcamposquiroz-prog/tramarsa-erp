const jwt    = require('jsonwebtoken');
const config = require('../config/env');

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, config.jwt.secret);
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};
