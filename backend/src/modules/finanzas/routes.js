const express = require('express');
const { query } = require('../../config/database');
const auth = require('../../middlewares/auth');

const router = express.Router();
router.use(auth);

// GET /api/finanzas/kpis
router.get('/kpis', async (req, res, next) => {
  try {
    const kpis = await query('SELECT * FROM vw_kpis_cobranza');
    const porEstado = await query(`
      SELECT estado, COUNT(*) as cantidad, COALESCE(SUM(total),0) as monto
      FROM facturas GROUP BY estado ORDER BY estado`);
    const tendencia = await query(`
      SELECT TO_CHAR(fecha_emision,'YYYY-MM') as mes,
             COUNT(*) as facturas,
             COALESCE(SUM(total),0) as monto_total,
             COALESCE(SUM(CASE WHEN estado='pagada' THEN total END),0) as monto_cobrado
      FROM facturas
      GROUP BY mes ORDER BY mes DESC LIMIT 6`);
    res.json({
      resumen: kpis.rows[0],
      por_estado: porEstado.rows,
      tendencia: tendencia.rows.reverse(),
    });
  } catch (err) { next(err); }
});

// GET /api/finanzas/cuentas-por-cobrar
router.get('/cuentas-por-cobrar', async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT f.*, c.razon_social as cliente_nombre,
             (CURRENT_DATE - f.fecha_vencimiento) as dias_vencida
      FROM facturas f JOIN clientes c ON f.cliente_id=c.id
      WHERE f.estado IN ('pendiente','parcial','vencida')
      ORDER BY f.fecha_vencimiento ASC`);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/finanzas/reporte-morosidad
router.get('/reporte-morosidad', async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT c.razon_social, c.ruc,
             COUNT(f.id) as facturas_pendientes,
             COALESCE(SUM(f.total),0) as monto_total,
             MAX(CURRENT_DATE - f.fecha_vencimiento) as max_dias_vencida
      FROM clientes c
      JOIN facturas f ON f.cliente_id = c.id
      WHERE f.estado IN ('pendiente','parcial','vencida')
        AND f.fecha_vencimiento < CURRENT_DATE
      GROUP BY c.id, c.razon_social, c.ruc
      ORDER BY monto_total DESC`);
    res.json(rows);
  } catch (err) { next(err); }
});

module.exports = router;
