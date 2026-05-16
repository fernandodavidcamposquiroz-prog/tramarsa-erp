const express      = require('express');
const cors         = require('cors');
const config       = require('./config/env');
const loadRoutes   = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares globales
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: config.nodeEnv, timestamp: new Date().toISOString() });
});

// Rutas
loadRoutes(app);

// Manejo de errores
app.use(errorHandler);

// Iniciar servidor
app.listen(config.port, () => {
  console.log(`[API] TRAMARSA ERP corriendo en http://localhost:${config.port}`);
  console.log(`[API] Entorno: ${config.nodeEnv}`);
});

module.exports = app;
