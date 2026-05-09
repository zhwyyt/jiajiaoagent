# PostgreSQL Schema Draft

## Project

小学生英语口语陪练 Agent（Android MVP）

## 1. Goal

定义 MVP 阶段的 PostgreSQL 持久化数据结构草案，覆盖：

- child profile
- topic definition
- session summary
- growth profile snapshot
- training plan

第一版目标是结构清晰、易实现，不追求一步到位覆盖所有未来教育能力。

## 2. Table Overview

建议首版包含以下核心表：

1. `children`
2. `child_preferences`
3. `topics`
4. `topic_prompts`
5. `sessions`
6. `session_turn_summaries`
7. `growth_profiles`
8. `training_plans`

## 3. Table Drafts

## 3.1 `children`

用途：
- 存储孩子主档案

建议字段：

- `id` UUID PK
- `display_name` TEXT NOT NULL
- `grade` SMALLINT NOT NULL
- `english_level` SMALLINT NOT NULL DEFAULT 1
- `confidence_level` TEXT NULL
- `chinese_support_level` TEXT NULL
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL

备注：
- MVP 默认只支持轻量试用，不必过早复杂化账号体系

## 3.2 `child_preferences`

用途：
- 存储孩子偏好与教学辅助信息

建议字段：

- `child_id` UUID PK REFERENCES `children(id)`
- `favorite_topics` JSONB NOT NULL DEFAULT '[]'
- `encouragement_style` TEXT NULL
- `attention_span_minutes` SMALLINT NULL
- `notes` JSONB NOT NULL DEFAULT '{}'
- `updated_at` TIMESTAMP NOT NULL

## 3.3 `topics`

用途：
- 存储主题定义

建议字段：

- `id` TEXT PK
- `title` TEXT NOT NULL
- `target_level_min` SMALLINT NOT NULL
- `target_level_max` SMALLINT NOT NULL
- `goals` JSONB NOT NULL
- `key_vocabulary` JSONB NOT NULL
- `key_patterns` JSONB NOT NULL
- `common_mistakes` JSONB NOT NULL DEFAULT '[]'
- `completion_signals` JSONB NOT NULL DEFAULT '[]'
- `is_active` BOOLEAN NOT NULL DEFAULT TRUE
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL

## 3.4 `topic_prompts`

用途：
- 存储主题问题与引导内容

建议字段：

- `id` UUID PK
- `topic_id` TEXT NOT NULL REFERENCES `topics(id)`
- `starter_questions` JSONB NOT NULL DEFAULT '[]'
- `follow_up_questions` JSONB NOT NULL DEFAULT '[]'
- `support_hints` JSONB NOT NULL DEFAULT '[]'
- `sample_answers` JSONB NOT NULL DEFAULT '[]'
- `updated_at` TIMESTAMP NOT NULL

## 3.5 `sessions`

用途：
- 存储单次会话摘要

建议字段：

- `id` UUID PK
- `child_id` UUID NOT NULL REFERENCES `children(id)`
- `topic_id` TEXT NOT NULL REFERENCES `topics(id)`
- `status` TEXT NOT NULL
- `turn_count` INTEGER NOT NULL DEFAULT 0
- `child_utterance_count` INTEGER NOT NULL DEFAULT 0
- `average_response_length` NUMERIC(6,2) NULL
- `highlighted_corrections` JSONB NOT NULL DEFAULT '[]'
- `strengths` JSONB NOT NULL DEFAULT '[]'
- `focus_areas` JSONB NOT NULL DEFAULT '[]'
- `topic_completed` BOOLEAN NOT NULL DEFAULT FALSE
- `next_practice_hints` JSONB NOT NULL DEFAULT '[]'
- `started_at` TIMESTAMP NOT NULL
- `ended_at` TIMESTAMP NULL
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL

## 3.6 `session_turn_summaries`

用途：
- 存储每轮的轻量摘要，便于回放和调试

建议字段：

- `id` UUID PK
- `session_id` UUID NOT NULL REFERENCES `sessions(id)`
- `turn_index` INTEGER NOT NULL
- `child_text` TEXT NULL
- `agent_text` TEXT NOT NULL
- `correction_focus` TEXT NULL
- `prompt_hint` TEXT NULL
- `created_at` TIMESTAMP NOT NULL

约束建议：
- `(session_id, turn_index)` UNIQUE

## 3.7 `growth_profiles`

用途：
- 存储孩子当前成长画像快照

建议字段：

- `child_id` UUID PK REFERENCES `children(id)`
- `current_speaking_level` SMALLINT NOT NULL
- `recent_topics` JSONB NOT NULL DEFAULT '[]'
- `strengths` JSONB NOT NULL DEFAULT '[]'
- `common_mistakes` JSONB NOT NULL DEFAULT '[]'
- `response_length_trend` TEXT NULL
- `practice_frequency_last_7_days` INTEGER NOT NULL DEFAULT 0
- `current_focus_areas` JSONB NOT NULL DEFAULT '[]'
- `latest_plan_summary` TEXT NULL
- `updated_at` TIMESTAMP NOT NULL

## 3.8 `training_plans`

用途：
- 存储系统生成的训练计划

建议字段：

- `id` UUID PK
- `child_id` UUID NOT NULL REFERENCES `children(id)`
- `period_type` TEXT NOT NULL
- `goals` JSONB NOT NULL DEFAULT '[]'
- `focus_topics` JSONB NOT NULL DEFAULT '[]'
- `focus_sentence_patterns` JSONB NOT NULL DEFAULT '[]'
- `practice_suggestions` JSONB NOT NULL DEFAULT '[]'
- `encouragement_note` TEXT NULL
- `source_session_ids` JSONB NOT NULL DEFAULT '[]'
- `generated_at` TIMESTAMP NOT NULL
- `created_at` TIMESTAMP NOT NULL

## 4. Index Suggestions

建议首版至少加这些索引：

- `sessions(child_id, started_at DESC)`
- `sessions(topic_id, started_at DESC)`
- `session_turn_summaries(session_id, turn_index)`
- `training_plans(child_id, generated_at DESC)`

## 5. MVP Notes

第一版刻意没有加入：

- 用户登录体系完整建模
- 家长账户体系
- 作业与试卷结构化表
- 复杂知识点实体表
- 发音评估结果表

这些能力后续可以增量加入。

## 6. Next Step

下一步可基于本草案：

1. 确定 ORM 或 migration 方案
2. 输出首版 SQL migration
3. 与 Hermes orchestration 输入输出进一步对齐
