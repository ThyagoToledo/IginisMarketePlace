const REQUIRED_CONFIGURATION = Object.freeze({
  database: 'DATABASE_URL',
  authSecret: 'AUTH_SECRET',
  githubClient: 'AUTH_GITHUB_ID',
  githubSecret: 'AUTH_GITHUB_SECRET',
  adminLogins: 'ADMIN_GITHUB_LOGINS',
});

export function buildConfigurationStatus(env) {
  return Object.fromEntries(
    Object.entries(REQUIRED_CONFIGURATION).map(([label, variable]) => [
      label,
      Boolean(String(env?.[variable] || '').trim()),
    ])
  );
}

export function safeEnvironmentName(value) {
  return ['development', 'production', 'test'].includes(value) ? value : 'unknown';
}
