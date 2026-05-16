const express = require('express');
const { query } = require('../../config/database');
const auth = require('../../middlewares/auth');

const router = express.Router();
router.use(auth);

// GET /api/compras/proveedores
router.get('/proveedores', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM proveedores WHERE activo=true ORDER BY razon_social');
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/compras/proveedores
router.post('/proveedores', async (req, res, next) => {
  try {
    const { ruc, razon_social, email, telefono, tipo } = req.body;
    const { rows } = await query(
      'INSERT INTO proveedores (ruc,razon_social,email,telefono,tipo) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [ruc, razon_social, email, telefono, tipo]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// GET /api/compras/ordenes
router.get('/ordenes', async (req, res, next) => {
  try {
    const { estado } = req.query;
    let sql = `SELECT oc.*, p.razon_social as proveedor_nombre
               FROM ordenes_compra oc JOIN proveedores p ON oc.proveedor_id=p.id WHERE 1=1`;
    const params = [];
    if (estado) { params.push(estado); sql += ` AND oc.estado=$${params.length}`; }
    sql += ' ORDER BY oc.fecha DESC';
    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/compras/ordenes
router.post('/ordenes', async (req, res, next) => {
  try {
    const { proveedor_id, fecha, total, descripcion } = req.body;
    const last = await query("SELECT numero FROM ordenes_compra ORDER BY id DESC LIMIT 1");
    const year = new Date().getFullYear();
    const nextNum = last.rows.length
      ? `OC-${year}-` + String(parseInt(last.rows[0].numero.split('-')[2]) + 1).padStart(3,'0')
      : `OC-${year}-001`;

    const { rows } = await query(
      'INSERT INTO ordenes_compra (numero,proveedor_id,fecha,total,descripcion) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [nextNum, proveedor_id, fecha, total, descripcion]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PATCH /api/compras/ordenes/:id/estado
router.patch('/ordenes/:id/estado', async (req, res, next) => {
  try {
    const { estado } = req.body;
    const { rows } = await query(
      'UPDATE ordenes_compra SET estado=$1 WHERE id=$2 RETURNING *',
      [estado, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Orden no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
