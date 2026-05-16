const db = require('./database');

const SCHEMA = [
  // 01 - usuarios
  `CREATE TABLE IF NOT EXISTS usuarios (
    id         SERIAL PRIMARY KEY,
    nombre     VARCHAR(100) NOT NULL,
    email      VARCHAR(100) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,
    rol        VARCHAR(20) NOT NULL DEFAULT 'agente',
    activo     BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  // 02 - clientes
  `CREATE TABLE IF NOT EXISTS clientes (
    id           SERIAL PRIMARY KEY,
    ruc          VARCHAR(11) UNIQUE,
    razon_social VARCHAR(200) NOT NULL,
    email        VARCHAR(100),
    telefono     VARCHAR(20),
    direccion    TEXT,
    tipo         VARCHAR(30) DEFAULT 'naviera',
    activo       BOOLEAN DEFAULT true,
    created_at   TIMESTAMP DEFAULT NOW()
  )`,
  // 02 - proveedores
  `CREATE TABLE IF NOT EXISTS proveedores (
    id           SERIAL PRIMARY KEY,
    ruc          VARCHAR(11) UNIQUE,
    razon_social VARCHAR(200) NOT NULL,
    email        VARCHAR(100),
    telefono     VARCHAR(20),
    tipo         VARCHAR(50),
    activo       BOOLEAN DEFAULT true,
    created_at   TIMESTAMP DEFAULT NOW()
  )`,
  // 03 - servicios
  `CREATE TABLE IF NOT EXISTS servicios (
    id              SERIAL PRIMARY KEY,
    codigo          VARCHAR(20) UNIQUE NOT NULL,
    nombre          VARCHAR(200) NOT NULL,
    descripcion     TEXT,
    categoria       VARCHAR(50),
    precio_unitario DECIMAL(12,2) NOT NULL,
    unidad          VARCHAR(20) DEFAULT 'servicio',
    stock           INT DEFAULT 0,
    activo          BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT NOW()
  )`,
  // 04 - facturas
  `CREATE TABLE IF NOT EXISTS facturas (
    id                SERIAL PRIMARY KEY,
    numero            VARCHAR(20) UNIQUE NOT NULL,
    cliente_id        INT REFERENCES clientes(id),
    fecha_emision     DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    subtotal          DECIMAL(12,2) NOT NULL,
    igv               DECIMAL(12,2) NOT NULL,
    total             DECIMAL(12,2) NOT NULL,
    estado            VARCHAR(20) DEFAULT 'pendiente',
    observacion       TEXT,
    created_at        TIMESTAMP DEFAULT NOW()
  )`,
  // 04 - factura_items
  `CREATE TABLE IF NOT EXISTS factura_items (
    id              SERIAL PRIMARY KEY,
    factura_id      INT REFERENCES facturas(id) ON DELETE CASCADE,
    servicio_id     INT REFERENCES servicios(id),
    descripcion     VARCHAR(200),
    cantidad        DECIMAL(10,2) NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    subtotal        DECIMAL(12,2) NOT NULL
  )`,
  // 05 - ordenes_compra
  `CREATE TABLE IF NOT EXISTS ordenes_compra (
    id           SERIAL PRIMARY KEY,
    numero       VARCHAR(20) UNIQUE NOT NULL,
    proveedor_id INT REFERENCES proveedores(id),
    fecha        DATE NOT NULL,
    total        DECIMAL(12,2) NOT NULL,
    estado       VARCHAR(20) DEFAULT 'pendiente',
    descripcion  TEXT,
    created_at   TIMESTAMP DEFAULT NOW()
  )`,
  // 05 - pagos
  `CREATE TABLE IF NOT EXISTS pagos (
    id                    SERIAL PRIMARY KEY,
    factura_id            INT REFERENCES facturas(id),
    fecha_pago            DATE NOT NULL,
    monto                 DECIMAL(12,2) NOT NULL,
    tipo                  VARCHAR(20) NOT NULL,
    referencia            VARCHAR(100),
    canal                 VARCHAR(50) DEFAULT 'transferencia',
    estado_detraccion     VARCHAR(20) DEFAULT 'no_aplica',
    monto_detraccion      DECIMAL(12,2) DEFAULT 0,
    porcentaje_detraccion DECIMAL(5,2) DEFAULT 0,
    validado_sunat        BOOLEAN DEFAULT false,
    observacion           TEXT,
    registrado_por        INT REFERENCES usuarios(id),
    created_at            TIMESTAMP DEFAULT NOW()
  )`,
  // 05 - extractos_bancarios
  `CREATE TABLE IF NOT EXISTS extractos_bancarios (
    id          SERIAL PRIMARY KEY,
    fecha       DATE NOT NULL,
    descripcion VARCHAR(200),
    monto       DECIMAL(12,2) NOT NULL,
    referencia  VARCHAR(100),
    estado      VARCHAR(20) DEFAULT 'no_identificado',
    pago_id     INT REFERENCES pagos(id),
    created_at  TIMESTAMP DEFAULT NOW()
  )`,
  // vista KPIs
  `CREATE OR REPLACE VIEW vw_kpis_cobranza AS
  SELECT
    COUNT(*) FILTER (WHERE estado = 'pendiente') AS facturas_pendientes,
    COUNT(*) FILTER (WHERE estado = 'vencida')   AS facturas_vencidas,
    COUNT(*) FILTER (WHERE estado = 'pagada')    AS facturas_pagadas,
    COALESCE(SUM(total) FILTER (WHERE estado IN ('pendiente','parcial','vencida')), 0) AS monto_por_cobrar,
    COALESCE(SUM(total) FILTER (WHERE estado = 'pagada'), 0) AS monto_cobrado,
    COALESCE(AVG(
      CASE WHEN estado = 'pagada'
      THEN (SELECT COALESCE(MAX(p.fecha_pago), f.fecha_vencimiento)
            FROM pagos p WHERE p.factura_id = f.id) - f.fecha_emision
      END
    ), 0)::INT AS dso_promedio_dias
  FROM facturas f`
];

async function migrate() {
  for (let i = 0; i < SCHEMA.length; i++) {
    console.log(`[MIGRATE] Ejecutando sentencia ${i + 1}/${SCHEMA.length}...`);
    await db.query(SCHEMA[i]);
  }
  console.log('[MIGRATE] Esquema creado exitosamente');
  process.exit(0);
}

migrate().catch(err => {
  console.error('[MIGRATE] Error:', err.message);
  process.exit(1);
});

