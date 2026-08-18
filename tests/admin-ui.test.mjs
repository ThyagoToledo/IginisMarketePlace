import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAdminUsersQuery } from '../lib/admin-users.mjs';
import { buildConfigurationStatus, safeEnvironmentName } from '../lib/admin-system.mjs';

test('normaliza a busca e a paginacao administrativa', () => {
  assert.deepEqual(
    parseAdminUsersQuery('https://forge.test/api/admin/users?q=%20ignis%20&status=banned&page=3&limit=10'),
    { q: 'ignis', status: 'banned', page: 3, limit: 10, offset: 20 }
  );
});

test('limita parametros invalidos da listagem de usuarios', () => {
  assert.deepEqual(
    parseAdminUsersQuery('https://forge.test/api/admin/users?status=unknown&page=-2&limit=500'),
    { q: '', status: 'all', page: 1, limit: 100, offset: 0 }
  );
});

test('diagnostico expoe somente presenca de configuracao', () => {
  const secret = 'valor-que-nao-pode-vazar';
  const status = buildConfigurationStatus({
    DATABASE_URL: secret,
    AUTH_SECRET: '',
    AUTH_GITHUB_ID: 'client-id',
    AUTH_GITHUB_SECRET: secret,
    ADMIN_GITHUB_LOGINS: 'admin',
  });

  assert.deepEqual(status, {
    database: true,
    authSecret: false,
    githubClient: true,
    githubSecret: true,
    adminLogins: true,
  });
  assert.equal(JSON.stringify(status).includes(secret), false);
});

test('ambiente desconhecido nao e refletido livremente', () => {
  assert.equal(safeEnvironmentName('production'), 'production');
  assert.equal(safeEnvironmentName('segredo-interno'), 'unknown');
});
