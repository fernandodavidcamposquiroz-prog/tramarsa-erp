-- ============================================
-- 02_clientes_proveedores.sql
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
  id           SERIAL PRIMARY KEY,
  ruc          VARCHAR(11) UNIQUE,
  razon_social VARCHAR(200) NOT NULL,
  email        VARCHAR(100),
  telefono     VARCHAR(20),
  direccion    TEXT,
  tipo         VARCHAR(30) DEFAULT 'naviera', -- naviera | armador | importador | exportador
  activo       BOOLEAN DEFAULT true,
  created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proveedores (
  id           SERIAL PRIMARY KEY,
  ruc          VARCHAR(11) UNIQUE,
  razon_social VARCHAR(200) NOT NULL,
  email        VARCHAR(100),
  telefono     VARCHAR(20),
  tipo         VARCHAR(50),  -- combustible | mantenimiento | suministros
  activo       BOOLEAN DEFAULT true,
  created_at   TIMESTAMP DEFAULT NOW()
);
