const fs   = require('fs');
const path = require('path');
const db   = require('./database');

async function seed() {
  const seedDir = path.resolve(__dirname, '../../database/seeds');
  const files = fs.readdirSync(seedDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(seedDir, file), 'utf8');
    console.log(`[SEED] Ejecutando ${file}...`);
    await db.query(sql);
    console.log(`[SEED] ${file} OK`);
  }
  console.log('[SEED] Datos de prueba cargados exitosamente');
  process.exit(0);
}

seed().catch(err => {
  console.error('[SEED] Error:', err.message);
  process.exit(1);
});
