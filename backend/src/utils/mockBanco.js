// Simulación de extracto bancario del Banco de la Nación
function descargarExtracto(fecha) {
  // En producción esto sería una llamada real a la API del BN
  return {
    banco: 'Banco de la Nación',
    cuenta: '0-000-123456',
    fecha,
    movimientos: [
      {
        referencia: `BN-${Date.now()}-001`,
        descripcion: 'TRANSF MSC PERU SAC RUC 20100070970',
        monto: 30000.00,
        tipo: 'credito',
        hora: '09:15:00',
      },
      {
        referencia: `BN-${Date.now()}-002`,
        descripcion: 'TRANSF MAERSK PERU SA RUC 20385739132',
        monto: 15000.00,
        tipo: 'credito',
        hora: '10:32:00',
      },
    ],
    timestamp: new Date().toISOString(),
    fuente: 'SIMULADO',
  };
}

module.exports = { descargarExtracto };
