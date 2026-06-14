'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Banner de consentimento de cookies. Guarda a escolha em localStorage.
export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem('ignis_cookie_consent')) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem('ignis_cookie_consent', 'accepted');
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="cookie-banner">
      <span>
        Usamos cookies essenciais (incluindo o login via GitHub) para o funcionamento do
        site. Ao continuar, voce concorda com nossa{' '}
        <Link href="/privacy">Politica de Privacidade e Cookies</Link> e os{' '}
        <Link href="/terms">Termos de Servico</Link>.
      </span>
      <button className="btn-gh" onClick={accept}>Aceitar</button>
    </div>
  );
}
