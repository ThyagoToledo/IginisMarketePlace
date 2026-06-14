import { neon } from '@neondatabase/serverless';

// Cliente SQL serverless do Neon. Le a connection string de DATABASE_URL
// (configurada no painel da Vercel em Project -> Settings -> Environment Variables,
// ou automaticamente ao conectar o banco Neon pela aba Storage).
//
// Uso: const rows = await sql`SELECT * FROM items`;
let _sql = null;

export function getSql() {
  if (_sql) return _sql;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL nao definida. Configure o banco Neon na Vercel.');
  }
  _sql = neon(url);
  return _sql;
}
