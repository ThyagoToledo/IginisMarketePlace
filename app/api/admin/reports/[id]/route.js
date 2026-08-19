import { getSql } from '../../../../../lib/db';
import { getCurrentAdmin } from '../../../../../lib/admin';
import { rejectCrossOriginMutation, serviceUnavailable } from '../../../../../lib/api-errors';

export async function POST(request, { params }) {
  const originError = rejectCrossOriginMutation(request);
  if (originError) return originError;
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return Response.json({ error: 'Acesso restrito.' }, { status: 403 });
    const { id: rawId } = await params;
    const id = Number(rawId);
    if (!Number.isSafeInteger(id) || id <= 0) return Response.json({ error: 'Relato inválido.' }, { status: 400 });
    const body = await request.json();
    const note = String(body.note || '').trim().slice(0, 4000);
    const sql = getSql();
    const reports = await sql`SELECT id,target_type,target_id,status FROM reports WHERE id=${id}`;
    const report = reports[0];
    if (!report) return Response.json({ error: 'Relato não encontrado.' }, { status: 404 });

    if (body.action === 'restore' && report.status === 'resolved') {
      let restoreQuery;
      let restoreAction;
      if (report.target_type === 'item') {
        restoreAction = 'restore_item';
        restoreQuery = sql`UPDATE items SET status='approved',hidden_at=NULL,hidden_by=NULL,hidden_reason=NULL WHERE id=${report.target_id} AND status='hidden'`;
      } else if (report.target_type === 'question') {
        restoreAction = 'restore_question';
        restoreQuery = sql`UPDATE community_questions SET status='published',hidden_at=NULL,hidden_by=NULL,hidden_reason=NULL,updated_at=now() WHERE id=${report.target_id} AND status='hidden'`;
      } else if (report.target_type === 'answer') {
        restoreAction = 'restore_answer';
        restoreQuery = sql`UPDATE community_answers SET status='published',hidden_at=NULL,hidden_by=NULL,hidden_reason=NULL,updated_at=now() WHERE id=${report.target_id} AND status='hidden'`;
      } else return Response.json({ error: 'Este conteúdo não possui restauração por este fluxo.' }, { status: 400 });
      await sql.transaction([
        restoreQuery,
        sql`UPDATE reports SET action_taken=${restoreAction},resolution_note=${note || 'Conteúdo restaurado'},moderator_id=${admin.id},updated_at=now() WHERE id=${id}`,
      ]);
      return Response.json({ ok: true });
    }
    if (body.action === 'review') {
      await sql`UPDATE reports SET status='reviewing',moderator_id=${admin.id},reviewed_at=now(),updated_at=now() WHERE id=${id} AND status='open'`;
      return Response.json({ ok: true });
    }
    if (body.action === 'dismiss') {
      await sql`UPDATE reports SET status='dismissed',resolution='dismissed',resolution_note=${note},action_taken='none',moderator_id=${admin.id},reviewed_at=COALESCE(reviewed_at,now()),resolved_at=now(),updated_at=now() WHERE id=${id} AND status IN ('open','reviewing')`;
      return Response.json({ ok: true });
    }
    if (body.action !== 'resolve' || !['open', 'reviewing'].includes(report.status)) return Response.json({ error: 'Ação ou estado inválido.' }, { status: 400 });

    let actionQuery;
    let actionTaken;
    if (report.target_type === 'item') {
      actionTaken = 'hide_item';
      actionQuery = sql`UPDATE items SET status='hidden',hidden_at=now(),hidden_by=${admin.id},hidden_reason=${note || 'Relato confirmado'} WHERE id=${report.target_id}`;
    } else if (report.target_type === 'user') {
      const targets = await sql`SELECT is_admin FROM users WHERE id=${report.target_id}`;
      if (!targets[0] || targets[0].is_admin) return Response.json({ error: 'Administradores não podem ser banidos por este fluxo.' }, { status: 400 });
      actionTaken = 'ban_user';
      actionQuery = sql`UPDATE users SET is_banned=true,ban_reason=${note || 'Relato confirmado'},banned_at=now(),banned_by=${admin.id} WHERE id=${report.target_id} AND is_admin=false`;
    } else if (report.target_type === 'organization') {
      actionTaken = 'ban_organization';
      actionQuery = sql`UPDATE organizations SET is_banned=true,ban_reason=${note || 'Relato confirmado'},banned_at=now(),banned_by=${admin.id},updated_at=now() WHERE id=${report.target_id}`;
    } else if (report.target_type === 'question') {
      actionTaken = 'hide_question';
      actionQuery = sql`UPDATE community_questions SET status='hidden',hidden_at=now(),hidden_by=${admin.id},hidden_reason=${note || 'Relato confirmado'},updated_at=now() WHERE id=${report.target_id}`;
    } else if (report.target_type === 'answer') {
      actionTaken = 'hide_answer';
      actionQuery = sql`UPDATE community_answers SET status='hidden',hidden_at=now(),hidden_by=${admin.id},hidden_reason=${note || 'Relato confirmado'},updated_at=now() WHERE id=${report.target_id}`;
    } else return Response.json({ error: 'Tipo de alvo inválido.' }, { status: 400 });
    await sql.transaction([
      actionQuery,
      sql`UPDATE reports SET status='resolved',resolution='confirmed',resolution_note=${note},action_taken=${actionTaken},moderator_id=${admin.id},reviewed_at=COALESCE(reviewed_at,now()),resolved_at=now(),updated_at=now() WHERE id=${id}`,
    ]);
    return Response.json({ ok: true });
  } catch (error) { return serviceUnavailable('admin.report.post', error); }
}
