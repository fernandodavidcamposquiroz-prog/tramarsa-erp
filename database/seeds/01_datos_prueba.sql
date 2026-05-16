-- ============================================
-- Seeds - Datos de prueba TRAMARSA
-- Ejecutar DESPUÉS del schema
-- ============================================

-- USUARIOS
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Admin TRAMARSA',    'admin@tramarsa.pe',   '$2b$10$rQZ9.1ZkOz3O6v5Y9QK8.eX3mJvHgT4RpKpN8YxL2BZSD7wlQnAiO', 'admin'),   -- pass: admin123
('Carlos Mendoza',    'cmendoza@tramarsa.pe','$2b$10$rQZ9.1ZkOz3O6v5Y9QK8.eX3mJvHgT4RpKpN8YxL2BZSD7wlQnAiO', 'agente'),  -- pass: admin123
('Gerente Finanzas',  'gerente@tramarsa.pe', '$2b$10$rQZ9.1ZkOz3O6v5Y9QK8.eX3mJvHgT4RpKpN8YxL2BZSD7wlQnAiO', 'gerente') -- pass: admin123
ON CONFLICT (email) DO NOTHING;

-- CLIENTES (Navieras reales del sector marítimo peruano)
INSERT INTO clientes (ruc, razon_social, email, telefono, tipo) VALUES
('20100070970', 'MSC PERU SAC',                     'cuentas@msc.com.pe',      '+51 1 611-6000', 'naviera'),
('20385739132', 'MAERSK PERU SA',                   'finance@maersk.com.pe',   '+51 1 630-9300', 'naviera'),
('20510229970', 'HAMBURG SUD PERU SAC',              'billing@hamburgsud.pe',   '+51 1 213-4800', 'naviera'),
('20260722980', 'CMA CGM PERU SAC',                 'cobros@cmacgm.com.pe',    '+51 1 625-7800', 'naviera'),
('20100896371', 'HAPAG-LLOYD PERU SAC',             'facturas@hapag-lloyd.pe', '+51 1 441-2222', 'naviera'),
('20601234567', 'ANDES IMPORT EXPORT SAC',          'pagos@andesie.com.pe',    '+51 1 999-1234', 'importador'),
('20709876543', 'MINERA ANTAMINA SA',               'finanzas@antamina.com.pe','+51 1 215-2600', 'exportador')
ON CONFLICT (ruc) DO NOTHING;

-- PROVEEDORES
INSERT INTO proveedores (ruc, razon_social, email, tipo) VALUES
('20100050450', 'REPSOL COMERCIAL SAC',        'facturas@repsol.pe',       'combustible'),
('20505545703', 'FERREYROS SA',                'ventas@ferreyros.com.pe',  'mantenimiento'),
('20100070970', 'SUMINISTROS PORTUARIOS SAC',  'ventas@suministros.pe',    'suministros'),
('20601111222', 'TECHMASTER SERVICIOS SAC',    'billing@techmaster.pe',    'tecnologia')
ON CONFLICT (ruc) DO NOTHING;

-- SERVICIOS MARÍTIMOS
INSERT INTO servicios (codigo, nombre, descripcion, categoria, precio_unitario, unidad) VALUES
('REM-001', 'Remolcaje Portuario Standard',     'Servicio de remolque para entrada/salida de puerto',    'remolcaje',     15000.00, 'maniobra'),
('REM-002', 'Remolcaje de Emergencia',           'Asistencia de emergencia en zona portuaria 24/7',       'remolcaje',     28000.00, 'maniobra'),
('PRA-001', 'Practicaje Puerto Callao',          'Servicio de piloto práctico para ingreso a puerto',     'practicaje',     8500.00, 'nave'),
('PRA-002', 'Practicaje Puertos Regionales',     'Servicio de pilotaje en puertos de Paita, Salaverry',   'practicaje',     6200.00, 'nave'),
('ALM-001', 'Almacenaje Contenedor 20''',       'Almacenaje por día de contenedor TEU',                  'almacenaje',       85.00, 'dia'),
('ALM-002', 'Almacenaje Contenedor 40''',       'Almacenaje por día de contenedor FEU',                  'almacenaje',      150.00, 'dia'),
('AGE-001', 'Agenciamiento Marítimo Completo',   'Gestión integral de documentación y trámites portuarios','agenciamiento',  4200.00, 'nave'),
('OPE-001', 'Operaciones Portuarias - Carga',    'Supervisión de carga y descarga de mercancía',          'operaciones',    3500.00, 'turno'),
('OPE-002', 'Logística y Transporte Interno',    'Traslado de mercancías en zona portuaria',              'operaciones',    2800.00, 'servicio')
ON CONFLICT (codigo) DO NOTHING;

-- FACTURAS (mezcla de estados para el demo)
INSERT INTO facturas (numero, cliente_id, fecha_emision, fecha_vencimiento, subtotal, igv, total, estado) VALUES
('F001-00001', 1, '2026-04-01', '2026-05-01', 42372.88, 7627.12,  50000.00, 'pagada'),
('F001-00002', 2, '2026-04-05', '2026-05-05', 25423.73, 4576.27,  30000.00, 'pendiente'),
('F001-00003', 3, '2026-04-10', '2026-05-10', 16949.15, 3050.85,  20000.00, 'vencida'),
('F001-00004', 1, '2026-04-15', '2026-05-15', 33898.31, 6101.69,  40000.00, 'parcial'),
('F001-00005', 4, '2026-04-20', '2026-05-20', 21186.44, 3813.56,  25000.00, 'pendiente'),
('F001-00006', 5, '2026-04-22', '2026-05-22', 12711.86, 2288.14,  15000.00, 'pendiente'),
('F001-00007', 6, '2026-04-25', '2026-05-25', 50847.46, 9152.54,  60000.00, 'pagada'),
('F001-00008', 2, '2026-04-28', '2026-05-28', 8474.58,  1525.42,  10000.00, 'vencida'),
('F001-00009', 7, '2026-05-01', '2026-06-01', 63559.32, 11440.68, 75000.00, 'pendiente'),
('F001-00010', 3, '2026-05-05', '2026-06-05', 29661.02, 5338.98,  35000.00, 'pendiente')
ON CONFLICT (numero) DO NOTHING;

-- ÓRDENES DE COMPRA
INSERT INTO ordenes_compra (numero, proveedor_id, fecha, total, estado, descripcion) VALUES
('OC-2026-001', 1, '2026-04-10', 45000.00, 'recibida',  'Combustible para remolcadores Q2 2026'),
('OC-2026-002', 2, '2026-04-15', 28000.00, 'aprobada',  'Mantenimiento correctivo remolcador RMS-01'),
('OC-2026-003', 3, '2026-04-20', 12500.00, 'pendiente', 'Suministros portuarios - guantes, EPP, señalética'),
('OC-2026-004', 4, '2026-05-01', 18000.00, 'aprobada',  'Licencias software gestión portuaria')
ON CONFLICT (numero) DO NOTHING;

-- PAGOS
INSERT INTO pagos (factura_id, fecha_pago, monto, tipo, referencia, canal, estado_detraccion, monto_detraccion, porcentaje_detraccion, validado_sunat, registrado_por) VALUES
(1, '2026-04-28', 50000.00, 'completo', 'BN-2026-001234', 'transferencia', 'validada', 2500.00, 5.00, true,  1),
(4, '2026-05-02', 20000.00, 'parcial',  'BN-2026-001890', 'transferencia', 'validada', 1000.00, 5.00, true,  2),
(7, '2026-05-03', 60000.00, 'completo', 'BN-2026-002100', 'transferencia', 'no_aplica',    0.00, 0.00, false, 1);

-- EXTRACTO BANCARIO de prueba (para simular carga)
INSERT INTO extractos_bancarios (fecha, descripcion, monto, referencia, estado) VALUES
('2026-05-10', 'TRANSF MAERSK PERU SA       RUC 20385739132', 30000.00, 'BN-2026-003001', 'no_identificado'),
('2026-05-10', 'TRANSF HAMBURG SUD PERU     RUC 20510229970',  8000.00, 'BN-2026-003002', 'no_identificado'),
('2026-05-11', 'TRANSF MSC PERU SAC         RUC 20100070970', 20000.00, 'BN-2026-003003', 'no_identificado');
