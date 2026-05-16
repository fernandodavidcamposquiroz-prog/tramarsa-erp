// Simulación de respuesta SUNAT para validación de detracciones
const TASAS_DETRACCION = {
  'remolcaje':     0.04,
  'practicaje':    0.04,
  'almacenaje':    0.04,
  'agenciamiento': 0.04,
  'operaciones':   0.04,
  'default':       0.04,
};

function validarDetraccion({ ruc, monto, tipoServicio }) {
  // Detracción aplica si monto > 700 soles (Resolución SUNAT)
  if (monto < 700) {
    return { aplica: false, motivo: 'Monto menor al mínimo (S/ 700)' };
  }

  const tasa = TASAS_DETRACCION[tipoServicio] || TASAS_DETRACCION.default;
  const montoDetraccion = +(monto * tasa).toFixed(2);

  return {
    aplica: true,
    tasa,
    porcentaje: tasa * 100,
    montoDetraccion,
    ruc,
    cuentaBN: '00-000-' + ruc.slice(-6),
    estado: 'VALIDADO',
    mensaje: `Detracción validada correctamente. Depositar S/ ${montoDetraccion} en cuenta BN`,
    timestamp: new Date().toISOString(),
  };
}

module.exports = { validarDetraccion };
