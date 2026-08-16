'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const reasons = ['Spam', 'Assédio', 'Violação de direitos autorais', 'Conteúdo impróprio', 'Outro'];

export default function ReportPage() {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [sent, setSent] = useState(false);

  return <main className="modal-page"><section className="panel report-dialog" role="dialog" aria-modal="true" aria-labelledby="report-title"><header className="dialog-header"><h2 id="report-title">⚑ Reportar conteúdo</h2><button className="icon-button" type="button" onClick={() => router.back()} aria-label="Fechar">×</button></header><div className="dialog-body">{sent ? <div className="result-ok"><strong>Relato preparado.</strong><p>A interface de moderação está pronta; o envio persistente será habilitado quando o esquema de relatos for adicionado ao banco.</p></div> : <><p>Ajude a manter a Forge segura e construtiva. Selecione a razão que melhor descreve o problema.</p><div className="report-options">{reasons.map((item) => <label key={item}><input type="radio" name="reason" checked={reason === item} onChange={() => setReason(item)} />{item}</label>)}</div><label className="field">Observações adicionais<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Forneça contexto para a equipe de moderação…" /></label></>}</div><footer className="dialog-footer"><button className="button button-ghost" type="button" onClick={() => router.back()}>Cancelar</button><button className="button button-primary" type="button" disabled={!reason || sent} onClick={() => setSent(true)}>Enviar relato</button></footer></section></main>;
}
