const express = require('express');
const { query } = require('../../config/database');
const auth = require('../../middlewares/auth');
const { validarDetraccion } = require('../../utils/mockSunat');
const { descargarExtracto } = require('../../utils/mockBanco');

const router = express.Router();
router.use(auth);

// GET /api/cobranza/pagos
router.get('/pagos', async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT p.*, f.numero as factura_numero, c.razon_social as cliente_nombre
      FROM pagos p
      JOIN facturas f ON p.factura_id = f.id
      JOIN clientes c ON f.cliente_id = c.id
      ORDER BY p.created_at DESC`);
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/cobranza/pagos — registrar pago
router.post('/pagos', async (req, res, next) => {
  try {
    const { factura_id, fecha_pago, monto, tipo, referencia, canal, observacion } = req.body;

    // Obtener factura
    const facResult = await query('SELECT * FROM facturas WHERE id=$1', [factura_id]);
    if (!facResult.rows.length) return res.status(404).json({ message: 'Factura no encontrada' });
    const factura = facResult.rows[0];

    // Verificar detracción con mock SUNAT
    const detraccion = validarDetraccion({ ruc: 'cliente-ruc', monto, tipoServicio: 'agenciamiento' });

    const pago = await query(
      `INSERT INTO pagos
         (factura_id,fecha_pago,monto,tipo,referencia,canal,
          estado_detraccion,monto_detraccion,porcentaje_detraccion,
          validado_sunat,observacion,registrado_por)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [
        factura_id, fecha_pago, monto, tipo, referencia, canal || 'transferencia',
        detraccion.aplica ? 'pendiente' : 'no_aplica',
        detraccion.aplica ? detraccion.montoDetraccion : 0,
        detraccion.aplica ? detraccion.porcentaje : 0,
        false, observacion, req.user.id,
      ]
    );

    // Actualizar estado de la factura
    const totalPagado = await query(
      'SELECT COALESCE(SUM(monto),0) as pagado FROM pagos WHERE factura_id=$1', [factura_id]
    );
    const pagado = parseFloat(totalPagado.rows[0].pagado);
    let nuevoEstado = 'parcial';
    if (pagado >= parseFloat(factura.total)) nuevoEstado = 'pagada';

    await query('UPDATE facturas SET estado=$1 WHERE id=$2', [nuevoEstado, factura_id]);

    res.status(201).json({ pago: pago.rows[0], detraccion, nuevo_estado_factura: nuevoEstado });
  } catch (err) { next(err); }
});

// POST /api/cobranza/validar-detraccion
router.post('/validar-detraccion', async (req, res, next) => {
  try {
    const { ruc, monto, tipo_servicio } = req.body;
    const resultado = validarDetraccion({ ruc, monto, tipoServicio: tipo_servicio });
    res.json(resultado);
  } catch (err) { next(err); }
});

// GET /api/cobranza/extractos
router.get('/extractos', async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT * FROM extractos_bancarios ORDER BY fecha DESC, id DESC'
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/cobranza/extractos/cargar — simula carga desde banco
router.post('/extractos/cargar', async (req, res, next) => {
  try {
    const { fecha } = req.body;
    const extracto = descargarExtracto(fecha || new Date().toISOString().split('T')[0]);

    const insertados = [];
    for (const mov of extracto.movimientos) {
      const existe = await query('SELECT id FROM extractos_bancarios WHERE referencia=$1', [mov.referencia]);
      if (!existe.rows.length) {
        const r = await query(
          'INSERT INTO extractos_bancarios (fecha,descripcion,monto,referencia) VALUES ($1,$2,$3,$4) RETURNING *',
          [extracto.fecha, mov.descripcion, mov.monto, mov.referencia]
        );
        insertados.push(r.rows[0]);
      }
    }
    res.json({ mensaje: `${insertados.length} movimientos importados`, movimientos: insertados });
  } catch (err) { next(err); }
});

// POST /api/cobranza/extractos/:id/emparejar — asignar extracto a factura
router.post('/extractos/:id/emparejar', async (req, res, next) => {
  try {
    const { factura_id, tipo } = req.body;
    const ext = await query('SELECT * FROM extractos_bancarios WHERE id=$1', [req.params.id]);
    if (!ext.rows.length) return res.status(404).json({ message: 'Movimiento no encontrado' });

    const extracto = ext.rows[0];

    // Crear pago
    const pagoRes = await query(
      `INSERT INTO pagos (factura_id,fecha_pago,monto,tipo,referencia,canal,registrado_por)
       VALUES ($1,$2,$3,$4,$5,'transferencia',$6) RETURNING *`,
      [factura_id, extracto.fecha, extracto.monto, tipo || 'completo', extracto.referencia, req.user.id]
    );

    // Marcar extracto como emparejado
    await query(
      'UPDATE extractos_bancarios SET estado=$1, pago_id=$2 WHERE id=$3',
      ['emparejado', pagoRes.rows[0].id, req.params.id]
    );

    res.json({ pago: pagoRes.rows[0], extracto: { ...extracto, estado: 'emparejado' } });
  } catch (err) { next(err); }
});

module.exports = router;
