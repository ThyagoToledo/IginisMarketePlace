-- IgnisEngine Marketplace - migracao 004: destaques e remocao do seed demonstrativo
-- Idempotente e segura para execucao repetida.

BEGIN;

CREATE TABLE IF NOT EXISTS item_promotions (
    id          BIGSERIAL PRIMARY KEY,
    item_id     INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    kind        TEXT NOT NULL CHECK (kind IN ('ignis', 'sponsored')),
    promoted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (item_id, kind)
);

CREATE INDEX IF NOT EXISTS item_promotions_kind_created_idx
    ON item_promotions (kind, created_at DESC);

-- Remove somente o seed conhecido e somente enquanto ele ainda pertence ao
-- usuario-sentinela legado. Uma criacao real reclamada por um usuario e preservada.
DELETE FROM items
WHERE author_id = (SELECT id FROM users WHERE github_id = 0)
  AND git_url IN (
    'https://github.com/ArthurArt/fantasy-trees-pack.git',
    'https://github.com/ChiptuneHero/retro-sfx-lib.git',
    'https://github.com/PhysTech/advanced-physics-2d.git',
    'https://github.com/MobileDev/virtual-gamepad-ignis.git',
    'https://github.com/NeonPixel/cyberpunk-tilemap.git'
  );

COMMIT;
