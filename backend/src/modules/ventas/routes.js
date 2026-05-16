const express = require('express');
const { query } = require('../../config/database');
const auth = require('../../middlewares/auth');

const router = express.Router();
router.use(auth);

// ── CLIENTES ─────────────────────────────────────────────────
// GET /api/ventas/clientes
router.get('/clientes', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM clientes WHERE activo=true ORDER BY razon_social');
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/ventas/clientes
router.post('/clientes', async (req, res, next) => {
  try {
    const { ruc, razon_social, email, telefono, direccion, tipo } = req.body;
    const { rows } = await query(
      `INSERT INTO clientes (ruc,razon_social,email,telefono,direccion,tipo)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [ruc, razon_social, email, telefono, direccion, tipo || 'naviera']
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// ── FACTURAS ─────────────────────────────────────────────────
// GET /api/ventas/facturas
router.get('/facturas', async (req, res, next) => {
  try {
    const { estado, cliente_id } = req.query;
    let sql = `
      SELECT f.*, c.razon_social as cliente_nombre, c.ruc as cliente_ruc
      FROM facturas f
      JOIN clientes c ON f.cliente_id = c.id
      WHERE 1=1`;
    const params = [];
    if (estado)     { params.push(estado);     sql += ` AND f.estado=$${params.length}`; }
    if (cliente_id) { params.push(cliente_id); sql += ` AND f.cliente_id=$${params.length}`; }
    sql += ' ORDER BY f.fecha_emision DESC';
    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/ventas/facturas/:id
router.get('/facturas/:id', async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT f.*, c.razon_social as cliente_nombre, c.ruc as cliente_ruc, c.email as cliente_email
      FROM facturas f JOIN clientes c ON f.cliente_id=c.id
      WHERE f.id=$1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Factura no encontrada' });

    const items = await query('SELECT fi.*, s.nombre as servicio_nombre FROM factura_items fi JOIN servicios s ON fi.servicio_id=s.id WHERE fi.factura_id=$1', [req.params.id]);
    res.json({ ...rows[0], items: items.rows });
  } catch (err) { next(err); }
});

// POST /api/ventas/facturas
router.post('/facturas', async (req, res, next) => {
  try {
    const { cliente_id, fecha_emision, fecha_vencimiento, items, observacion } = req.body;
    const subtotal = items.reduce((s, i) => s + i.cantidad * i.precio_unitario, 0);
    const igv      = +(subtotal * 0.18).toFixed(2);
    const total    = +(subtotal + igv).toFixed(2);

    // Generar número correlativo
    const last = await query("SELECT numero FROM facturas ORDER BY id DESC LIMIT 1");
    const nextNum = last.rows.length
      ? 'F001-' + String(parseInt(last.rows[0].numero.split('-')[1]) + 1).padStart(5, '0')
      : 'F001-00001';

    const fac = await query(
      `INSERT INTO facturas (numero,cliente_id,fecha_emision,fecha_vencimiento,subtotal,igv,total,observacion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [nextNum, cliente_id, fecha_emision, fecha_vencimiento, subtotal.toFixed(2), igv, total, observacion]
    );
    const factura = fac.rows[0];

    for (const item of items) {
      const sub = +(item.cantidad * item.precio_unitario).toFixed(2);
      await query(
        `INSERT INTO factura_items (factura_id,servicio_id,descripcion,cantidad,precio_unitario,subtotal)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [factura.id, item.servicio_id, item.descripcion, item.cantidad, item.precio_unitario, sub]
      );
    }
    res.status(201).json(factura);
  } catch (err) { next(err); }
});

module.exports = router;
