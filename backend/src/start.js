const db = require('./config/database');

// ── Schema ────────────────────────────────────────────────────────────────────
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS usuarios (
    id         SERIAL PRIMARY KEY,
    nombre     VARCHAR(100) NOT NULL,
    email      VARCHAR(100) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,
    rol        VARCHAR(20) NOT NULL DEFAULT 'agente',
    activo     BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
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
  `CREATE TABLE IF NOT EXISTS factura_items (
    id              SERIAL PRIMARY KEY,
    factura_id      INT REFERENCES facturas(id) ON DELETE CASCADE,
    servicio_id     INT REFERENCES servicios(id),
    descripcion     VARCHAR(200),
    cantidad        DECIMAL(10,2) NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    subtotal        DECIMAL(12,2) NOT NULL
  )`,
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
  `CREATE OR REPLACE VIEW vw_kpis_cobranza AS
  SELECT
    COUNT(*) FILTER (WHERE estado = 'pendiente') AS facturas_pendientes,
    COUNT(*) FILTER (WHERE estado = 'vencida')   AS facturas_vencidas,
    COUNT(*) FILTER (WHERE estado = 'pagada')    AS facturas_pagadas,
    COALESCE(SUM(total) FILTER (WHERE estado IN ('pendiente','parcial','vencida')), 0) AS monto_por_cobrar,
    COALESCE(SUM(total) FILTER (WHERE estado = 'pagada'), 0) AS monto_cobrado,
    0::INT AS dso_promedio_dias
  FROM facturas f`
];

// ── Seed ─────────────────────────────────────────────────────────────────────
const HASH = '$2a$10$IoWnd/8cRgzk0FWejWbm0uekRb5snbi.MTUSTRcztAKn3hvrm80Um';

const SEEDS = [
  `INSERT INTO usuarios (nombre, email, password, rol) VALUES
   ('Admin TRAMARSA',   'admin@tramarsa.pe',   '${HASH}', 'admin'),
   ('Carlos Mendoza',   'cmendoza@tramarsa.pe','${HASH}', 'agente'),
   ('Gerente Finanzas', 'gerente@tramarsa.pe', '${HASH}', 'gerente')
   ON CONFLICT (email) DO NOTHING`,

  `INSERT INTO clientes (ruc, razon_social, email, telefono, tipo) VALUES
   ('20100070970', 'MSC PERU SAC',           'cuentas@msc.com.pe',      '+51 1 611-6000', 'naviera'),
   ('20385739132', 'MAERSK PERU SA',          'finance@maersk.com.pe',   '+51 1 630-9300', 'naviera'),
   ('20510229970', 'HAMBURG SUD PERU SAC',    'billing@hamburgsud.pe',   '+51 1 213-4800', 'naviera'),
   ('20260722980', 'CMA CGM PERU SAC',        'cobros@cmacgm.com.pe',    '+51 1 625-7800', 'naviera'),
   ('20100896371', 'HAPAG-LLOYD PERU SAC',    'facturas@hapag-lloyd.pe', '+51 1 441-2222', 'naviera'),
   ('20601234567', 'ANDES IMPORT EXPORT SAC', 'pagos@andesie.com.pe',    '+51 1 999-1234', 'importador'),
   ('20709876543', 'MINERA ANTAMINA SA',      'finanzas@antamina.com.pe','+51 1 215-2600', 'exportador')
   ON CONFLICT (ruc) DO NOTHING`,

  `INSERT INTO proveedores (ruc, razon_social, email, tipo) VALUES
   ('20100050450', 'REPSOL COMERCIAL SAC',       'facturas@repsol.pe',      'combustible'),
   ('20505545703', 'FERREYROS SA',               'ventas@ferreyros.com.pe', 'mantenimiento'),
   ('20199999999', 'SUMINISTROS PORTUARIOS SAC', 'ventas@suministros.pe',   'suministros'),
   ('20601111222', 'TECHMASTER SERVICIOS SAC',   'billing@techmaster.pe',   'tecnologia')
   ON CONFLICT (ruc) DO NOTHING`,

  `INSERT INTO servicios (codigo, nombre, descripcion, categoria, precio_unitario, unidad) VALUES
   ('REM-001', 'Remolcaje Portuario Standard',   'Remolque para entrada/salida de puerto',        'remolcaje',    15000.00, 'maniobra'),
   ('REM-002', 'Remolcaje de Emergencia',         'Asistencia de emergencia 24/7',                 'remolcaje',    28000.00, 'maniobra'),
   ('PRA-001', 'Practicaje Puerto Callao',        'Piloto practico para ingreso a puerto',         'practicaje',    8500.00, 'nave'),
   ('PRA-002', 'Practicaje Puertos Regionales',   'Pilotaje en Paita, Salaverry',                  'practicaje',    6200.00, 'nave'),
   ('ALM-001', 'Almacenaje Contenedor 20ft',      'Almacenaje por dia contenedor TEU',             'almacenaje',      85.00, 'dia'),
   ('ALM-002', 'Almacenaje Contenedor 40ft',      'Almacenaje por dia contenedor FEU',             'almacenaje',     150.00, 'dia'),
   ('AGE-001', 'Agenciamiento Maritimo Completo', 'Gestion integral de documentacion portuaria',   'agenciamiento', 4200.00, 'nave'),
   ('OPE-001', 'Operaciones Portuarias - Carga',  'Supervision de carga y descarga',               'operaciones',   3500.00, 'turno'),
   ('OPE-002', 'Logistica y Transporte Interno',  'Traslado de mercancias en zona portuaria',      'operaciones',   2800.00, 'servicio')
   ON CONFLICT (codigo) DO NOTHING`,

  `INSERT INTO facturas (numero, cliente_id, fecha_emision, fecha_vencimiento, subtotal, igv, total, estado) VALUES
   ('F001-00001', 1, '2026-04-01', '2026-05-01', 42372.88,  7627.12,  50000.00, 'pagada'),
   ('F001-00002', 2, '2026-04-05', '2026-05-05', 25423.73,  4576.27,  30000.00, 'pendiente'),
   ('F001-00003', 3, '2026-04-10', '2026-05-10', 16949.15,  3050.85,  20000.00, 'vencida'),
   ('F001-00004', 1, '2026-04-15', '2026-05-15', 33898.31,  6101.69,  40000.00, 'parcial'),
   ('F001-00005', 4, '2026-04-20', '2026-05-20', 21186.44,  3813.56,  25000.00, 'pendiente'),
   ('F001-00006', 5, '2026-04-22', '2026-05-22', 12711.86,  2288.14,  15000.00, 'pendiente'),
   ('F001-00007', 6, '2026-04-25', '2026-05-25', 50847.46,  9152.54,  60000.00, 'pagada'),
   ('F001-00008', 2, '2026-04-28', '2026-05-28',  8474.58,  1525.42,  10000.00, 'vencida'),
   ('F001-00009', 7, '2026-05-01', '2026-06-01', 63559.32, 11440.68,  75000.00, 'pendiente'),
   ('F001-00010', 3, '2026-05-05', '2026-06-05', 29661.02,  5338.98,  35000.00, 'pendiente')
   ON CONFLICT (numero) DO NOTHING`,

  `INSERT INTO ordenes_compra (numero, proveedor_id, fecha, total, estado, descripcion) VALUES
   ('OC-2026-001', 1, '2026-04-10', 45000.00, 'recibida',  'Combustible remolcadores Q2 2026'),
   ('OC-2026-002', 2, '2026-04-15', 28000.00, 'aprobada',  'Mantenimiento correctivo remolcador RMS-01'),
   ('OC-2026-003', 3, '2026-04-20', 12500.00, 'pendiente', 'Suministros portuarios EPP y senaletica'),
   ('OC-2026-004', 4, '2026-05-01', 18000.00, 'aprobada',  'Licencias software gestion portuaria')
   ON CONFLICT (numero) DO NOTHING`
];

// ── Bootstrap ─────────────────────────────────────────────────────────────────
async function run() {
  // 1. Migrate
  console.log('[SETUP] Creando esquema...');
  for (let i = 0; i < SCHEMA.length; i++) {
    await db.query(SCHEMA[i]);
  }
  console.log('[SETUP] Esquema OK');

  // 2. Seed (no-fatal: si ya hay datos simplemente continua)
  console.log('[SETUP] Cargando datos de prueba...');
  for (let i = 0; i < SEEDS.length; i++) {
    try {
      await db.query(SEEDS[i]);
    } catch (e) {
      console.warn(`[SETUP] Seed ${i + 1} omitido:`, e.message);
    }
  }
  console.log('[SETUP] Datos OK');

  // 3. Insert pagos referenciando IDs reales
  try {
    const f1 = await db.query(`SELECT id FROM facturas WHERE numero = 'F001-00001'`);
    const f4 = await db.query(`SELECT id FROM facturas WHERE numero = 'F001-00004'`);
    const f7 = await db.query(`SELECT id FROM facturas WHERE numero = 'F001-00007'`);
    const u1 = await db.query(`SELECT id FROM usuarios WHERE email = 'admin@tramarsa.pe'`);
    const u2 = await db.query(`SELECT id FROM usuarios WHERE email = 'cmendoza@tramarsa.pe'`);

    if (f1.rows[0] && f4.rows[0] && f7.rows[0] && u1.rows[0]) {
      await db.query(`
        INSERT INTO pagos (factura_id, fecha_pago, monto, tipo, referencia, canal, estado_detraccion, monto_detraccion, porcentaje_detraccion, validado_sunat, registrado_por)
        VALUES
        ($1, '2026-04-28', 50000.00, 'completo', 'BN-2026-001234', 'transferencia', 'validada',  2500.00, 5.00, true,  $4),
        ($2, '2026-05-02', 20000.00, 'parcial',  'BN-2026-001890', 'transferencia', 'validada',  1000.00, 5.00, true,  $5),
        ($3, '2026-05-03', 60000.00, 'completo', 'BN-2026-002100', 'transferencia', 'no_aplica',    0.00, 0.00, false, $4)
        ON CONFLICT DO NOTHING
      `, [f1.rows[0].id, f4.rows[0].id, f7.rows[0].id, u1.rows[0].id, u2.rows[0].id]);
    }
  } catch (e) {
    console.warn('[SETUP] Pagos omitidos:', e.message);
  }

  try {
    await db.query(`
      INSERT INTO extractos_bancarios (fecha, descripcion, monto, referencia, estado) VALUES
      ('2026-05-10', 'TRANSF MAERSK PERU SA       RUC 20385739132', 30000.00, 'BN-2026-003001', 'no_identificado'),
      ('2026-05-10', 'TRANSF HAMBURG SUD PERU     RUC 20510229970',  8000.00, 'BN-2026-003002', 'no_identificado'),
      ('2026-05-11', 'TRANSF MSC PERU SAC         RUC 20100070970', 20000.00, 'BN-2026-003003', 'no_identificado')
    `);
  } catch (e) {
    console.warn('[SETUP] Extractos omitidos:', e.message);
  }

  console.log('[SETUP] Inicializacion completa. Arrancando API...');

  // 4. Iniciar Express
  require('./app');
}

run().catch(err => {
  console.error('[SETUP] Error fatal:', err.message);
  console.error(err.stack);
  process.exit(1);
});
