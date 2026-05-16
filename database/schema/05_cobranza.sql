-- ============================================
-- 05_cobranza.sql - Pagos y detracciones
-- ============================================
CREATE TABLE IF NOT EXISTS pagos (
  id                  SERIAL PRIMARY KEY,
  factura_id          INT REFERENCES facturas(id),
  fecha_pago          DATE NOT NULL,
  monto               DECIMAL(12,2) NOT NULL,
  tipo                VARCHAR(20) NOT NULL, -- completo | parcial | anticipo
  referencia          VARCHAR(100),         -- número de operación bancaria
  canal               VARCHAR(50) DEFAULT 'transferencia',
  estado_detraccion   VARCHAR(20) DEFAULT 'no_aplica', -- no_aplica | pendiente | validada
  monto_detraccion    DECIMAL(12,2) DEFAULT 0,
  porcentaje_detraccion DECIMAL(5,2) DEFAULT 0,
  validado_sunat      BOOLEAN DEFAULT false,
  observacion         TEXT,
  registrado_por      INT REFERENCES usuarios(id),
  created_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS extractos_bancarios (
  id          SERIAL PRIMARY KEY,
  fecha       DATE NOT NULL,
  descripcion VARCHAR(200),
  monto       DECIMAL(12,2) NOT NULL,
  referencia  VARCHAR(100),
  estado      VARCHAR(20) DEFAULT 'no_identificado', -- no_identificado | emparejado
  pago_id     INT REFERENCES pagos(id),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Vista de KPIs para cobranza
CREATE OR REPLACE VIEW vw_kpis_cobranza AS
SELECT
  COUNT(*) FILTER (WHERE estado = 'pendiente')                   AS facturas_pendientes,
  COUNT(*) FILTER (WHERE estado = 'vencida')                     AS facturas_vencidas,
  COUNT(*) FILTER (WHERE estado = 'pagada')                      AS facturas_pagadas,
  COALESCE(SUM(total) FILTER (WHERE estado IN ('pendiente','parcial','vencida')), 0) AS monto_por_cobrar,
  COALESCE(SUM(total) FILTER (WHERE estado = 'pagada'), 0)        AS monto_cobrado,
  COALESCE(AVG(
    CASE WHEN estado = 'pagada'
    THEN (SELECT COALESCE(MAX(p.fecha_pago), f.fecha_vencimiento)
          FROM pagos p WHERE p.factura_id = f.id) - f.fecha_emision
    END
  ), 0)::INT                                                      AS dso_promedio_dias
FROM facturas f;
