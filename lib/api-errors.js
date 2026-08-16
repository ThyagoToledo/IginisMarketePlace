export function serviceUnavailable(scope, error) {
  console.error(`[${scope}]`, {
    name: error?.name || 'Error',
    code: error?.code || null,
  });
  return Response.json(
    { error: 'Servico temporariamente indisponivel.' },
    { status: 503 }
  );
}

export function rejectCrossOriginMutation(request) {
  const origin = request.headers.get('origin');
  if (!origin) return null;

  const expectedOrigin = new URL(request.url).origin;
  if (origin === expectedOrigin) return null;
  return Response.json({ error: 'Origem da requisicao invalida.' }, { status: 403 });
}
