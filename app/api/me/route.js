import { auth } from '../../../auth';

export const dynamic = 'force-dynamic';

// GET /api/me -> dados do usuario logado (ou {authenticated:false}).
export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return Response.json({ authenticated: false });
  }
  return Response.json({
    authenticated: true,
    id: session.user.id,
    name: session.user.name,
    login: session.user.login,
    avatar: session.user.image,
    isAdmin: !!session.user.isAdmin,
    isBanned: !!session.user.isBanned,
  });
}
