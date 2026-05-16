-- ============================================
-- 03_inventarios.sql - Servicios marítimos
-- ============================================
CREATE TABLE IF NOT EXISTS servicios (
  id              SERIAL PRIMARY KEY,
  codigo          VARCHAR(20) UNIQUE NOT NULL,
  nombre          VARCHAR(200) NOT NULL,
  descripcion     TEXT,
  categoria       VARCHAR(50),  -- remolcaje | practicaje | almacenaje | agenciamiento | operaciones
  precio_unitario DECIMAL(12,2) NOT NULL,
  unidad          VARCHAR(20) DEFAULT 'servicio',
  stock           INT DEFAULT 0,  -- para insumos físicos
  activo          BOOLEAN DEFAULT true,
  created_at      TIMESTAMP DEFAULT NOW()
);
