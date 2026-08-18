export const ADMIN_USER_STATUSES = Object.freeze(['all', 'active', 'banned', 'admin']);

export function parseAdminUsersQuery(input) {
  const params = input instanceof URLSearchParams
    ? input
    : new URL(String(input), 'http://localhost').searchParams;
  const q = String(params.get('q') || '').trim().slice(0, 100);
  const requestedStatus = String(params.get('status') || 'all');
  const status = ADMIN_USER_STATUSES.includes(requestedStatus) ? requestedStatus : 'all';
  const requestedPage = Number(params.get('page') || 1);
  const requestedLimit = Number(params.get('limit') || 25);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const limit = Number.isSafeInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 100)
    : 25;

  return { q, status, page, limit, offset: (page - 1) * limit };
}
