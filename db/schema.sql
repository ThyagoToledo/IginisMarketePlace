-- Esquema do banco do IgnisEngine Marketplace (Neon / Postgres)
-- Rode este script UMA VEZ no SQL Editor do Neon antes de importar o CSV.
-- Regra do roadmap: o backend guarda apenas URLs Git, nunca binarios.

CREATE TABLE IF NOT EXISTS items (
    id               SERIAL PRIMARY KEY,
    type             TEXT NOT NULL CHECK (type IN ('plugin', 'workshop', 'asset')),
    name             TEXT NOT NULL,
    author           TEXT NOT NULL,
    description      TEXT NOT NULL DEFAULT '',
    version          TEXT NOT NULL DEFAULT '1.0.0',
    git_url          TEXT NOT NULL,
    cover_image_text TEXT NOT NULL DEFAULT '',
    dependencies     TEXT NOT NULL DEFAULT 'None',
    downloads        INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Evita duplicar o mesmo pacote (mesmo repo Git).
CREATE UNIQUE INDEX IF NOT EXISTS items_git_url_uniq ON items (git_url);

-- Acelera o filtro por aba (plugin / workshop / asset).
CREATE INDEX IF NOT EXISTS items_type_idx ON items (type);
