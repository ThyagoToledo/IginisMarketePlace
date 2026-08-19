-- IgnisEngine Marketplace - migracao 006: perguntas, respostas e atividade real.
-- Idempotente. Nao cria perguntas, respostas ou eventos demonstrativos.

BEGIN;

CREATE TABLE IF NOT EXISTS community_questions (
    id            SERIAL PRIMARY KEY,
    author_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    body          TEXT NOT NULL,
    category      TEXT NOT NULL DEFAULT 'general',
    status        TEXT NOT NULL DEFAULT 'published',
    hidden_at     TIMESTAMPTZ,
    hidden_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    hidden_reason TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT community_questions_title_length_check CHECK (char_length(title) BETWEEN 8 AND 160),
    CONSTRAINT community_questions_body_length_check CHECK (char_length(body) BETWEEN 20 AND 10000),
    CONSTRAINT community_questions_category_check CHECK (category IN ('general', 'graphics', 'scripting', 'assets', 'help')),
    CONSTRAINT community_questions_status_check CHECK (status IN ('published', 'hidden')),
    CONSTRAINT community_questions_hidden_reason_check CHECK (hidden_reason IS NULL OR char_length(hidden_reason) <= 1000)
);

CREATE INDEX IF NOT EXISTS community_questions_feed_idx
    ON community_questions (status, created_at DESC);
CREATE INDEX IF NOT EXISTS community_questions_author_idx
    ON community_questions (author_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS community_questions_search_idx
    ON community_questions (lower(title));

CREATE TABLE IF NOT EXISTS community_answers (
    id            SERIAL PRIMARY KEY,
    question_id   INTEGER NOT NULL REFERENCES community_questions(id) ON DELETE CASCADE,
    author_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body          TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'published',
    hidden_at     TIMESTAMPTZ,
    hidden_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    hidden_reason TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT community_answers_body_length_check CHECK (char_length(body) BETWEEN 2 AND 10000),
    CONSTRAINT community_answers_status_check CHECK (status IN ('published', 'hidden')),
    CONSTRAINT community_answers_hidden_reason_check CHECK (hidden_reason IS NULL OR char_length(hidden_reason) <= 1000)
);

CREATE INDEX IF NOT EXISTS community_answers_question_idx
    ON community_answers (question_id, status, created_at);
CREATE INDEX IF NOT EXISTS community_answers_author_idx
    ON community_answers (author_id, status, created_at DESC);

ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_target_type_check;
ALTER TABLE reports ADD CONSTRAINT reports_target_type_check
    CHECK (target_type IN ('item', 'user', 'organization', 'question', 'answer'));

ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_action_check;
ALTER TABLE reports ADD CONSTRAINT reports_action_check
    CHECK (action_taken IS NULL OR action_taken IN (
        'none', 'hide_item', 'restore_item', 'ban_user', 'unban_user',
        'ban_organization', 'unban_organization',
        'hide_question', 'restore_question', 'hide_answer', 'restore_answer'
    ));

COMMIT;
