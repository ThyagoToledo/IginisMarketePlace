import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { getSql } from './lib/db';

// Admins do marketplace: ThyagoToledo e FeronZerbana (configuravel por env).
// Esses usuarios recebem is_admin=true automaticamente ao logar.
const ADMIN_LOGINS = (process.env.ADMIN_GITHUB_LOGINS || 'ThyagoToledo,FeronZerbana')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  session: { strategy: 'jwt' },
  pages: {
    // usa a pagina padrao do Auth.js; erro de banido cai aqui
    error: '/',
  },
  callbacks: {
    // Cria/atualiza o usuario no banco e bloqueia banidos.
    async signIn({ profile }) {
      if (!profile || !profile.id) return false;
      try {
        const sql = getSql();
        const login = String(profile.login || '').toLowerCase();
        const isAdmin = ADMIN_LOGINS.includes(login);
        const rows = await sql`
          INSERT INTO users (github_id, username, display_name, email, avatar_url, is_admin)
          VALUES (${profile.id}, ${profile.login}, ${profile.name || profile.login},
                  ${profile.email || null}, ${profile.avatar_url || null}, ${isAdmin})
          ON CONFLICT (github_id) DO UPDATE SET
            username = EXCLUDED.username,
            display_name = EXCLUDED.display_name,
            email = COALESCE(EXCLUDED.email, users.email),
            avatar_url = EXCLUDED.avatar_url,
            is_admin = users.is_admin OR ${isAdmin}
          RETURNING is_banned`;
        // Banido nao entra.
        if (rows[0] && rows[0].is_banned) return false;
        return true;
      } catch (err) {
        console.error('[auth] signIn falhou:', err);
        return false;
      }
    },
    async jwt({ token, profile }) {
      // No login, anexa dados do nosso banco ao token.
      if (profile && profile.id) {
        try {
          const sql = getSql();
          const rows = await sql`
            SELECT id, is_admin, is_banned FROM users WHERE github_id = ${profile.id}`;
          if (rows[0]) {
            token.uid = rows[0].id;
            token.isAdmin = rows[0].is_admin;
            token.isBanned = rows[0].is_banned;
            token.login = profile.login;
          }
        } catch (err) {
          console.error('[auth] jwt falhou:', err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid || null;
        session.user.isAdmin = !!token.isAdmin;
        session.user.isBanned = !!token.isBanned;
        session.user.login = token.login || null;
      }
      return session;
    },
  },
});
