-- ===========================================================================
-- IgnisEngine Marketplace - migracao 003: tokens de API (publicar pelo editor)
-- Idempotente. Cole no Neon SQL Editor e clique em Run.
-- ===========================================================================

-- Tokens de acesso para publicar fora do navegador (ex: editor Java).
-- Guardamos apenas o HASH (SHA-256) do token, nunca o valor em texto.
CREATE TABLE IF NOT EXISTS api_tokens (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash   TEXT UNIQUE NOT NULL,
    token_prefix TEXT NOT NULL,         -- primeiros chars, so para exibir/identificar
    name         TEXT,                  -- rotulo opcional ("meu PC", etc.)
    last_used_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS api_tokens_user_idx ON api_tokens (user_id);

-- Conferencia
SELECT count(*) AS total_tokens FROM api_tokens;
