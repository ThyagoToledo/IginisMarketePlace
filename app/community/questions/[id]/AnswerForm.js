'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AnswerForm({ questionId }) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const response = await fetch(`/api/community/questions/${questionId}/answers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body }) });
    const data = await response.json(); setBusy(false);
    if (response.ok) { setBody(''); router.refresh(); }
    else setError(data.error || 'Não foi possível responder.');
  }
  return <form className="panel answer-compose" onSubmit={submit}><h2>Sua resposta</h2><label className="field"><textarea required minLength={2} maxLength={10000} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Compartilhe uma solução, explicação ou referência relevante." /></label>{error && <p className="result-err">{error}</p>}<button className="button button-primary" disabled={busy}>{busy ? 'Publicando…' : 'Publicar resposta'}</button></form>;
}
