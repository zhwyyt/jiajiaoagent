CREATE TABLE learning_session_summaries (
    session_id UUID PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
    child_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    ended_at TIMESTAMPTZ NOT NULL,
    summary_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE learning_snapshots (
    child_id TEXT PRIMARY KEY,
    snapshot_json JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE learner_profiles (
    child_id TEXT PRIMARY KEY,
    profile_json JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_learning_session_summaries_child_ended_at
    ON learning_session_summaries(child_id, ended_at DESC);

CREATE INDEX idx_learning_session_summaries_topic_ended_at
    ON learning_session_summaries(topic_id, ended_at DESC);

CREATE INDEX idx_learning_snapshots_updated_at
    ON learning_snapshots(updated_at DESC);

CREATE INDEX idx_learner_profiles_updated_at
    ON learner_profiles(updated_at DESC);
