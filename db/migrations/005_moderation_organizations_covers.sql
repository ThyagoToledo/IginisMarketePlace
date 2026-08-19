-- IgnisEngine Marketplace - migracao 005: capas, organizacoes e moderacao manual.
-- Idempotente. Nao cria dados demonstrativos nem altera itens/usuarios existentes.

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_by INTEGER;

DO $migration$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'users_banned_by_fkey' AND conrelid = 'users'::regclass
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_banned_by_fkey
            FOREIGN KEY (banned_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END
$migration$;

CREATE TABLE IF NOT EXISTS organizations (
    id          SERIAL PRIMARY KEY,
    slug        TEXT NOT NULL,
    name        TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    created_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_banned   BOOLEAN NOT NULL DEFAULT false,
    ban_reason  TEXT,
    banned_at   TIMESTAMPTZ,
    banned_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT organizations_slug_format_check CHECK (
        slug = lower(slug) AND slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$'
    ),
    CONSTRAINT organizations_name_length_check CHECK (char_length(name) BETWEEN 3 AND 80),
    CONSTRAINT organizations_description_length_check CHECK (char_length(description) <= 500),
    CONSTRAINT organizations_ban_reason_length_check CHECK (
        ban_reason IS NULL OR char_length(ban_reason) <= 500
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS organizations_slug_lower_uniq ON organizations (lower(slug));
CREATE INDEX IF NOT EXISTS organizations_status_created_idx ON organizations (is_banned, created_at DESC);
CREATE INDEX IF NOT EXISTS organizations_name_search_idx ON organizations (lower(name));

CREATE TABLE IF NOT EXISTS organization_members (
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role             TEXT NOT NULL,
    status           TEXT NOT NULL DEFAULT 'invited',
    invited_by       INTEGER REFERENCES users(id) ON DELETE SET NULL,
    invited_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    accepted_at      TIMESTAMPTZ,
    PRIMARY KEY (organization_id, user_id),
    CONSTRAINT organization_members_role_check CHECK (role IN ('owner', 'admin', 'member')),
    CONSTRAINT organization_members_status_check CHECK (status IN ('invited', 'active')),
    CONSTRAINT organization_members_acceptance_check CHECK (
        (status = 'invited' AND accepted_at IS NULL)
        OR (status = 'active' AND accepted_at IS NOT NULL)
    ),
    CONSTRAINT organization_members_owner_active_check CHECK (role <> 'owner' OR status = 'active')
);

CREATE INDEX IF NOT EXISTS organization_members_user_status_idx
    ON organization_members (user_id, status);
CREATE INDEX IF NOT EXISTS organization_members_org_role_idx
    ON organization_members (organization_id, role, status);

ALTER TABLE items ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS organization_id INTEGER;
ALTER TABLE items ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ;
ALTER TABLE items ADD COLUMN IF NOT EXISTS hidden_by INTEGER;
ALTER TABLE items ADD COLUMN IF NOT EXISTS hidden_reason TEXT;

DO $migration$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'items_organization_id_fkey' AND conrelid = 'items'::regclass
    ) THEN
        ALTER TABLE items ADD CONSTRAINT items_organization_id_fkey
            FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'items_hidden_by_fkey' AND conrelid = 'items'::regclass
    ) THEN
        ALTER TABLE items ADD CONSTRAINT items_hidden_by_fkey
            FOREIGN KEY (hidden_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'items_status_check' AND conrelid = 'items'::regclass
    ) THEN
        ALTER TABLE items ADD CONSTRAINT items_status_check
            CHECK (status IN ('approved', 'pending', 'rejected', 'hidden')) NOT VALID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'items_cover_image_url_check' AND conrelid = 'items'::regclass
    ) THEN
        ALTER TABLE items ADD CONSTRAINT items_cover_image_url_check
            CHECK (
                cover_image_url IS NULL
                OR (char_length(cover_image_url) <= 2048 AND cover_image_url ~* '^https://')
            ) NOT VALID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'items_hidden_reason_length_check' AND conrelid = 'items'::regclass
    ) THEN
        ALTER TABLE items ADD CONSTRAINT items_hidden_reason_length_check
            CHECK (hidden_reason IS NULL OR char_length(hidden_reason) <= 1000) NOT VALID;
    END IF;
END
$migration$;

ALTER TABLE items VALIDATE CONSTRAINT items_status_check;
ALTER TABLE items VALIDATE CONSTRAINT items_cover_image_url_check;
ALTER TABLE items VALIDATE CONSTRAINT items_hidden_reason_length_check;

CREATE INDEX IF NOT EXISTS items_organization_status_idx
    ON items (organization_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS items_hidden_status_idx
    ON items (status, hidden_at DESC) WHERE status = 'hidden';

CREATE TABLE IF NOT EXISTS reports (
    id              SERIAL PRIMARY KEY,
    reporter_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    target_type     TEXT NOT NULL,
    target_id       INTEGER NOT NULL,
    target_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    reason          TEXT NOT NULL,
    details         TEXT NOT NULL DEFAULT '',
    status          TEXT NOT NULL DEFAULT 'open',
    moderator_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
    resolution      TEXT,
    resolution_note TEXT,
    action_taken    TEXT,
    reviewed_at     TIMESTAMPTZ,
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT reports_target_type_check CHECK (target_type IN ('item', 'user', 'organization')),
    CONSTRAINT reports_reason_check CHECK (
        reason IN ('spam', 'harassment', 'copyright', 'inappropriate', 'other')
    ),
    CONSTRAINT reports_status_check CHECK (
        status IN ('open', 'reviewing', 'resolved', 'dismissed')
    ),
    CONSTRAINT reports_resolution_check CHECK (
        resolution IS NULL OR resolution IN ('confirmed', 'dismissed')
    ),
    CONSTRAINT reports_action_check CHECK (
        action_taken IS NULL OR action_taken IN (
            'none', 'hide_item', 'restore_item', 'ban_user', 'unban_user',
            'ban_organization', 'unban_organization'
        )
    ),
    CONSTRAINT reports_details_length_check CHECK (char_length(details) <= 4000),
    CONSTRAINT reports_resolution_note_length_check CHECK (
        resolution_note IS NULL OR char_length(resolution_note) <= 4000
    ),
    CONSTRAINT reports_lifecycle_check CHECK (
        (status IN ('open', 'reviewing') AND resolution IS NULL AND resolved_at IS NULL)
        OR (status = 'resolved' AND resolution = 'confirmed' AND resolved_at IS NOT NULL)
        OR (status = 'dismissed' AND resolution = 'dismissed' AND resolved_at IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS reports_queue_idx ON reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS reports_target_idx ON reports (target_type, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS reports_reporter_idx ON reports (reporter_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS reports_active_reporter_target_uniq
    ON reports (reporter_id, target_type, target_id)
    WHERE reporter_id IS NOT NULL AND status IN ('open', 'reviewing');

COMMIT;
