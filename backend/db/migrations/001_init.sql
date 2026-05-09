CREATE TABLE children (
    id UUID PRIMARY KEY,
    display_name TEXT NOT NULL,
    grade SMALLINT NOT NULL,
    english_level SMALLINT NOT NULL DEFAULT 1,
    confidence_level TEXT,
    chinese_support_level TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE child_preferences (
    child_id UUID PRIMARY KEY REFERENCES children(id),
    favorite_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    encouragement_style TEXT,
    attention_span_minutes SMALLINT,
    notes JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE topics (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    target_level_min SMALLINT NOT NULL,
    target_level_max SMALLINT NOT NULL,
    goals JSONB NOT NULL,
    key_vocabulary JSONB NOT NULL,
    key_patterns JSONB NOT NULL,
    common_mistakes JSONB NOT NULL DEFAULT '[]'::jsonb,
    completion_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE topic_prompts (
    id UUID PRIMARY KEY,
    topic_id TEXT NOT NULL REFERENCES topics(id),
    starter_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    follow_up_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    support_hints JSONB NOT NULL DEFAULT '[]'::jsonb,
    sample_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES children(id),
    topic_id TEXT NOT NULL REFERENCES topics(id),
    status TEXT NOT NULL,
    turn_count INTEGER NOT NULL DEFAULT 0,
    child_utterance_count INTEGER NOT NULL DEFAULT 0,
    average_response_length NUMERIC(6, 2),
    highlighted_corrections JSONB NOT NULL DEFAULT '[]'::jsonb,
    strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
    focus_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
    topic_completed BOOLEAN NOT NULL DEFAULT FALSE,
    next_practice_hints JSONB NOT NULL DEFAULT '[]'::jsonb,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE session_turn_summaries (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES sessions(id),
    turn_index INTEGER NOT NULL,
    child_text TEXT,
    agent_text TEXT NOT NULL,
    correction_focus TEXT,
    prompt_hint TEXT,
    created_at TIMESTAMP NOT NULL,
    UNIQUE (session_id, turn_index)
);

CREATE TABLE growth_profiles (
    child_id UUID PRIMARY KEY REFERENCES children(id),
    current_speaking_level SMALLINT NOT NULL,
    recent_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
    common_mistakes JSONB NOT NULL DEFAULT '[]'::jsonb,
    response_length_trend TEXT,
    practice_frequency_last_7_days INTEGER NOT NULL DEFAULT 0,
    current_focus_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
    latest_plan_summary TEXT,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE training_plans (
    id UUID PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES children(id),
    period_type TEXT NOT NULL,
    goals JSONB NOT NULL DEFAULT '[]'::jsonb,
    focus_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    focus_sentence_patterns JSONB NOT NULL DEFAULT '[]'::jsonb,
    practice_suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
    encouragement_note TEXT,
    source_session_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    generated_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_sessions_child_started_at ON sessions(child_id, started_at DESC);
CREATE INDEX idx_sessions_topic_started_at ON sessions(topic_id, started_at DESC);
CREATE INDEX idx_session_turn_summaries_session_turn ON session_turn_summaries(session_id, turn_index);
CREATE INDEX idx_training_plans_child_generated_at ON training_plans(child_id, generated_at DESC);
