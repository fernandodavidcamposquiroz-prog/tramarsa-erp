-- ============================================
-- 01_usuarios.sql - Autenticación y roles
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id        SERIAL PRIMARY KEY,
  nombre    VARCHAR(100) NOT NULL,
  email     VARCHAR(100) UNIQUE NOT NULL,
  password  VARCHAR(255) NOT NULL,
  rol       VARCHAR(20) NOT NULL DEFAULT 'agente', -- admin | agente | gerente
  activo    BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
