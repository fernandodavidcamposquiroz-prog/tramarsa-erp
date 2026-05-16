const authRoutes       = require('../modules/auth/routes');
const ventasRoutes     = require('../modules/ventas/routes');
const comprasRoutes    = require('../modules/compras/routes');
const inventariosRoutes = require('../modules/inventarios/routes');
const finanzasRoutes   = require('../modules/finanzas/routes');
const cobranzaRoutes   = require('../modules/cobranza/routes');

module.exports = (app) => {
  app.use('/api/auth',        authRoutes);
  app.use('/api/ventas',      ventasRoutes);
  app.use('/api/compras',     comprasRoutes);
  app.use('/api/inventarios', inventariosRoutes);
  app.use('/api/finanzas',    finanzasRoutes);
  app.use('/api/cobranza',    cobranzaRoutes);
};
