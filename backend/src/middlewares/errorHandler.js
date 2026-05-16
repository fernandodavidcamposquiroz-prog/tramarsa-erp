const config = require('../config/env');

module.exports = function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${err.message}`);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Error interno del servidor',
    ...(config.nodeEnv !== 'production' && { stack: err.stack }),
  });
};
