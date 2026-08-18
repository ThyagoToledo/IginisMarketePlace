import { auth } from '../../../../auth';
import { getSql } from '../../../../lib/db';
import { buildConfigurationStatus, safeEnvironmentName } from '../../../../lib/admin-system.mjs';
import packageInfo from '../../../../package.json';

export const dynamic = 'force-dynamic';

// Diagnostico administrativo somente-leitura. Nunca retorna valores de variaveis.
export async function GET() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return Response.json({ error: 'Acesso restrito a administradores.' }, { status: 403 });
  }

  const startedAt = Date.now();
  let database = { status: 'unavailable', latencyMs: null };
  try {
    const sql = getSql();
    await sql`SELECT 1 AS ok`;
    database = { status: 'connected', latencyMs: Date.now() - startedAt };
  } catch {
    database = { status: 'unavailable', latencyMs: Date.now() - startedAt };
  }

  return Response.json({
    status: database.status === 'connected' ? 'ok' : 'degraded',
    api: 'online',
    database,
    application: {
      version: packageInfo.version,
      environment: safeEnvironmentName(process.env.NODE_ENV),
    },
    configuration: buildConfigurationStatus(process.env),
    checkedAt: new Date().toISOString(),
  });
}
