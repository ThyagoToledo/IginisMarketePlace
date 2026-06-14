-- ===========================================================================
-- IgnisEngine Marketplace - migracao 002: usuarios, seguranca e admin
-- Idempotente: pode rodar varias vezes / mesmo apos a criacao inicial de items.
-- Cole tudo no Neon SQL Editor e clique em Run.
-- ===========================================================================

-- 1) USUARIOS (identidade unica via GitHub)
CREATE TABLE IF NOT EXISTS users (
    id                SERIAL PRIMARY KEY,
    github_id         BIGINT UNIQUE NOT NULL,
    username          TEXT NOT NULL,
    display_name      TEXT,
    email             TEXT,
    avatar_url        TEXT,
    is_admin          BOOLEAN NOT NULL DEFAULT false,
    is_banned         BOOLEAN NOT NULL DEFAULT false,
    ban_reason        TEXT,
    accepted_terms_at TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS users_username_idx ON users (lower(username));

-- 2) ITEMS (cria no formato novo se ainda nao existir)
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
    author_id        INTEGER REFERENCES users(id),
    status           TEXT NOT NULL DEFAULT 'approved',
    security_report  JSONB,
    rejection_reason TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2b) Garante as colunas novas caso a tabela items ja existisse (do passo anterior)
ALTER TABLE items ADD COLUMN IF NOT EXISTS author_id        INTEGER REFERENCES users(id);
ALTER TABLE items ADD COLUMN IF NOT EXISTS status           TEXT NOT NULL DEFAULT 'approved';
ALTER TABLE items ADD COLUMN IF NOT EXISTS security_report  JSONB;
ALTER TABLE items ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 3) Indices
CREATE UNIQUE INDEX IF NOT EXISTS items_git_url_uniq ON items (git_url);
CREATE INDEX IF NOT EXISTS items_type_idx   ON items (type);
CREATE INDEX IF NOT EXISTS items_status_idx ON items (status);
CREATE INDEX IF NOT EXISTS items_author_idx ON items (author_id);

-- 4) Usuario "legado": dono dos itens iniciais (github_id 0 = sentinela interna)
INSERT INTO users (github_id, username, display_name, is_admin)
VALUES (0, 'legacy', 'Catalogo Legado', false)
ON CONFLICT (github_id) DO NOTHING;

-- 5) Dados iniciais do catalogo (nao duplica se ja existirem)
INSERT INTO items (type, name, author, description, version, git_url, cover_image_text, dependencies, downloads) VALUES
('workshop','Pixel Fantasy Trees Pack','Arthur_Art','Beautiful hand-drawn 2D sprite pack containing 16 unique fantasy trees.','1.2.0','https://github.com/ArthurArt/fantasy-trees-pack.git','Sprite Pack','None',128),
('workshop','Retro Sound FX Library','ChiptuneHero','Collection of 40 chiptune sound effects (.wav) for retro games.','1.0.0','https://github.com/ChiptuneHero/retro-sfx-lib.git','SFX Library','None',86),
('plugin','Advanced Physics 2D','PhysTech','Decoupled rigidbodies and collision solver plugin with friction and bounce.','2.1.0','https://github.com/PhysTech/advanced-physics-2d.git','Physics Engine','Core-Physics >= 1.0',342),
('plugin','Virtual Gamepad UI Overlay','MobileDev','Adds a mobile-friendly virtual joystick overlay to screen automatically.','1.0.5','https://github.com/MobileDev/virtual-gamepad-ignis.git','Mobile Gamepad','UI-Canvas >= 2.0',57),
('asset','Cyberpunk Tilemap 32x32','NeonPixel','32x32 tileset containing city backgrounds, neon lights and pavements.','1.1.0','https://github.com/NeonPixel/cyberpunk-tilemap.git','Neon Tileset','None',201)
ON CONFLICT (git_url) DO NOTHING;

-- 6) Vincula itens sem dono ao usuario legado e deixa aprovados
UPDATE items
SET author_id = (SELECT id FROM users WHERE github_id = 0)
WHERE author_id IS NULL;

-- 7) Admins: ThyagoToledo e FeronZerbana
--    (o login ja promove automaticamente; este UPDATE cobre quem ja logou antes)
UPDATE users SET is_admin = true
WHERE lower(username) IN ('thyagotoledo', 'feronzerbana');

-- 8) Conferencias
SELECT count(*) AS total_itens FROM items;
SELECT id, username, is_admin, is_banned FROM users ORDER BY id;
