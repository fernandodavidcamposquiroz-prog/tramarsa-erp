-- ============================================
-- 04_ventas.sql - Facturas
-- ============================================
CREATE TABLE IF NOT EXISTS facturas (
  id               SERIAL PRIMARY KEY,
  numero           VARCHAR(20) UNIQUE NOT NULL,  -- F001-00001
  cliente_id       INT REFERENCES clientes(id),
  fecha_emision    DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  subtotal         DECIMAL(12,2) NOT NULL,
  igv              DECIMAL(12,2) NOT NULL,
  total            DECIMAL(12,2) NOT NULL,
  estado           VARCHAR(20) DEFAULT 'pendiente', -- pendiente | parcial | pagada | vencida
  observacion      TEXT,
  created_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS factura_items (
  id              SERIAL PRIMARY KEY,
  factura_id      INT REFERENCES facturas(id) ON DELETE CASCADE,
  servicio_id     INT REFERENCES servicios(id),
  descripcion     VARCHAR(200),
  cantidad        DECIMAL(10,2) NOT NULL,
  precio_unitario DECIMAL(12,2) NOT NULL,
  subtotal        DECIMAL(12,2) NOT NULL
);

-- ============================================
-- 05_compras.sql - Órdenes de compra
-- ============================================
CREATE TABLE IF NOT EXISTS ordenes_compra (
  id           SERIAL PRIMARY KEY,
  numero       VARCHAR(20) UNIQUE NOT NULL,
  proveedor_id INT REFERENCES proveedores(id),
  fecha        DATE NOT NULL,
  total        DECIMAL(12,2) NOT NULL,
  estado       VARCHAR(20) DEFAULT 'pendiente', -- pendiente | aprobada | recibida | cancelada
  descripcion  TEXT,
  created_at   TIMESTAMP DEFAULT NOW()
);
