import { getCurrentAdmin } from '../../../../lib/admin';
import { getSql } from '../../../../lib/db';
import { rejectCrossOriginMutation, serviceUnavailable } from '../../../../lib/api-errors';
import { parsePromotionMutation } from '../../../../lib/promotions.mjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return forbidden();

    const sql = getSql();
    const rows = await sql`
      SELECT i.id, i.name, i.author, i.type, i.status,
             EXISTS (SELECT 1 FROM item_promotions p WHERE p.item_id = i.id AND p.kind = 'ignis') AS "ignisFeatured",
             EXISTS (SELECT 1 FROM item_promotions p WHERE p.item_id = i.id AND p.kind = 'sponsored') AS "sponsoredFeatured"
      FROM items i
      LEFT JOIN users u ON u.id = i.author_id
      WHERE i.status = 'approved' AND COALESCE(u.is_banned, false) = false
      ORDER BY i.created_at DESC, i.id DESC`;
    return Response.json(rows);
  } catch (error) {
    return serviceUnavailable('admin.highlights.get', error);
  }
}

export async function POST(request) {
  const originError = rejectCrossOriginMutation(request);
  if (originError) return originError;

  try {
    const admin = await getCurrentAdmin();
    if (!admin) return forbidden();

    const mutation = parsePromotionMutation(await request.json());
    if (!mutation.ok) {
      return Response.json({ error: mutation.error }, { status: 400 });
    }

    const sql = getSql();
    const items = await sql`
      SELECT i.id
      FROM items i
      LEFT JOIN users u ON u.id = i.author_id
      WHERE i.id = ${mutation.itemId} AND i.status = 'approved'
        AND COALESCE(u.is_banned, false) = false`;
    if (!items[0]) {
      return Response.json({ error: 'Criacao aprovada nao encontrada.' }, { status: 404 });
    }

    if (mutation.action === 'add') {
      await sql`
        INSERT INTO item_promotions (item_id, kind, promoted_by)
        VALUES (${mutation.itemId}, ${mutation.kind}, ${admin.id})
        ON CONFLICT (item_id, kind) DO UPDATE SET
          promoted_by = EXCLUDED.promoted_by, created_at = now()`;
    } else {
      await sql`
        DELETE FROM item_promotions
        WHERE item_id = ${mutation.itemId} AND kind = ${mutation.kind}`;
    }

    return Response.json({ ok: true });
  } catch (error) {
    return serviceUnavailable('admin.highlights.post', error);
  }
}

function forbidden() {
  return Response.json({ error: 'Acesso restrito a administradores.' }, { status: 403 });
}
