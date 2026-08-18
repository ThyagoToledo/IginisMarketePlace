'use client';

import { useRouter } from 'next/navigation';

export default function ReportPage() {
  const router = useRouter();

  return (
    <main className="modal-page">
      <section className="panel report-dialog" role="dialog" aria-modal="true" aria-labelledby="report-title">
        <header className="dialog-header">
          <h2 id="report-title">⚑ Reportar conteúdo</h2>
          <button className="icon-button" type="button" onClick={() => router.back()} aria-label="Fechar">×</button>
        </header>
        <div className="dialog-body report-wip-body">
          <span className="wip-badge">WIP</span>
          <h3>Envio de relatos ainda indisponível</h3>
          <p className="muted">A Forge não simula o envio nem mantém denúncias apenas nesta sessão. O formulário será habilitado quando a persistência de moderação estiver disponível.</p>
        </div>
        <footer className="dialog-footer">
          <button className="button button-primary" type="button" onClick={() => router.back()}>Voltar</button>
        </footer>
      </section>
    </main>
  );
}
