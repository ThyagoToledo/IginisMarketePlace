import { auth } from '../../../auth';
import { getSql } from '../../../lib/db';
import { parseReportPayload } from '../../../lib/reports.mjs';
import { rejectCrossOriginMutation, serviceUnavailable } from '../../../lib/api-errors';

export async function POST(request) {
  const originError=rejectCrossOriginMutation(request);if(originError)return originError;
  try {
    const session=await auth();const reporterId=Number(session?.user?.id);
    if(!Number.isSafeInteger(reporterId)||reporterId<=0)return Response.json({error:'Faça login para enviar um relato.'},{status:401});
    const parsed=parseReportPayload(await request.json());if(!parsed.ok)return Response.json({error:parsed.error},{status:400});
    const sql=getSql();const users=await sql`SELECT is_banned FROM users WHERE id=${reporterId}`;if(!users[0]||users[0].is_banned)return Response.json({error:'Conta sem permissão.'},{status:403});
    let target;
    if(parsed.targetType==='item'){const rows=await sql`SELECT id,name,author_id AS "authorId",organization_id AS "organizationId",status FROM items WHERE id=${parsed.targetId}`;target=rows[0];if(target&&Number(target.authorId)===reporterId)return Response.json({error:'Você não pode denunciar sua própria criação.'},{status:400});if(target?.organizationId){const own=await sql`SELECT 1 FROM organization_members WHERE organization_id=${target.organizationId} AND user_id=${reporterId} AND status='active'`;if(own[0])return Response.json({error:'Você não pode denunciar uma criação da sua organização.'},{status:400})}}
    if(parsed.targetType==='user'){const rows=await sql`SELECT id,username,display_name AS "displayName",is_banned AS "isBanned" FROM users WHERE id=${parsed.targetId}`;target=rows[0];if(Number(target?.id)===reporterId)return Response.json({error:'Você não pode denunciar seu próprio perfil.'},{status:400})}
    if(parsed.targetType==='organization'){const rows=await sql`SELECT id,slug,name,is_banned AS "isBanned" FROM organizations WHERE id=${parsed.targetId}`;target=rows[0];if(target){const own=await sql`SELECT 1 FROM organization_members WHERE organization_id=${target.id} AND user_id=${reporterId} AND status='active'`;if(own[0])return Response.json({error:'Você não pode denunciar sua própria organização.'},{status:400})}}
    if(parsed.targetType==='question'){const rows=await sql`SELECT id,title,author_id AS "authorId",status FROM community_questions WHERE id=${parsed.targetId} AND status='published'`;target=rows[0];if(Number(target?.authorId)===reporterId)return Response.json({error:'Você não pode denunciar sua própria pergunta.'},{status:400})}
    if(parsed.targetType==='answer'){const rows=await sql`SELECT id,question_id AS "questionId",author_id AS "authorId",left(body,500) AS body,status FROM community_answers WHERE id=${parsed.targetId} AND status='published'`;target=rows[0];if(Number(target?.authorId)===reporterId)return Response.json({error:'Você não pode denunciar sua própria resposta.'},{status:400})}
    if(!target)return Response.json({error:'O conteúdo denunciado não foi encontrado.'},{status:404});
    const rows=await sql`INSERT INTO reports (reporter_id,target_type,target_id,target_snapshot,reason,details) VALUES (${reporterId},${parsed.targetType},${parsed.targetId},${JSON.stringify(target)},${parsed.reason},${parsed.details}) RETURNING id,status,created_at AS "createdAt"`;
    return Response.json({ok:true,report:rows[0]},{status:201});
  } catch(error){if(error?.code==='23505')return Response.json({error:'Você já possui um relato ativo para este conteúdo.'},{status:409});return serviceUnavailable('reports.post',error)}
}
