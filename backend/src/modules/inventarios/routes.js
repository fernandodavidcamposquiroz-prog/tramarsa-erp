const express = require('express');
const { query } = require('../../config/database');
const auth = require('../../middlewares/auth');

const router = express.Router();
router.use(auth);

// GET /api/inventarios/servicios
router.get('/servicios', async (req, res, next) => {
  try {
    const { categoria } = req.query;
    let sql = 'SELECT * FROM servicios WHERE activo=true';
    const params = [];
    if (categoria) { params.push(categoria); sql += ` AND categoria=$${params.length}`; }
    sql += ' ORDER BY categoria, nombre';
    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/inventarios/servicios/:id
router.get('/servicios/:id', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM servicios WHERE id=$1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Servicio no encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /api/inventarios/servicios
router.post('/servicios', async (req, res, next) => {
  try {
    const { codigo, nombre, descripcion, categoria, precio_unitario, unidad, stock } = req.body;
    const { rows } = await query(
      `INSERT INTO servicios (codigo,nombre,descripcion,categoria,precio_unitario,unidad,stock)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [codigo, nombre, descripcion, categoria, precio_unitario, unidad || 'servicio', stock || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/inventarios/servicios/:id
router.put('/servicios/:id', async (req, res, next) => {
  try {
    const { nombre, descripcion, precio_unitario, stock } = req.body;
    const { rows } = await query(
      `UPDATE servicios SET nombre=$1, descripcion=$2, precio_unitario=$3, stock=$4
       WHERE id=$5 RETURNING *`,
      [nombre, descripcion, precio_unitario, stock, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Servicio no encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// GET /api/inventarios/categorias
router.get('/categorias', async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT DISTINCT categoria, COUNT(*) as total FROM servicios WHERE activo=true GROUP BY categoria ORDER BY categoria'
    );
    res.json(rows);
  } catch (err) { next(err); }
});

module.exports = router;
