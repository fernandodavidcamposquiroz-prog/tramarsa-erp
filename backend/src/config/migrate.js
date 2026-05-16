const fs   = require('fs');
const path = require('path');
const db   = require('./database');

async function migrate() {
  const schemaDir = path.resolve(__dirname, '../../../database/schema');
  const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(schemaDir, file), 'utf8');
    console.log(`[MIGRATE] Ejecutando ${file}...`);
    await db.query(sql);
    console.log(`[MIGRATE] ${file} OK`);
  }
  console.log('[MIGRATE] Esquema creado exitosamente');
  process.exit(0);
}

migrate().catch(err => {
  console.error('[MIGRATE] Error:', err.message);
  process.exit(1);
});
