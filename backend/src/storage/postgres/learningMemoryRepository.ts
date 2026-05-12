import type { Pool } from "pg";
import type {
  LearnerProfile,
  LearningSnapshot,
  SessionSummary
} from "../../types/session.js";
import type { LearningMemoryRepository } from "../learningMemoryRepository.js";

interface JsonRow<T> {
  payload_json: T;
}

export class PostgresLearningMemoryRepository implements LearningMemoryRepository {
  constructor(private readonly pool: Pool) {}

  async getSessionSummary(sessionId: string): Promise<SessionSummary | null> {
    const result = await this.pool.query<JsonRow<SessionSummary>>(
      `
      SELECT summary_json AS payload_json
      FROM learning_session_summaries
      WHERE session_id = $1
      `,
      [sessionId]
    );

    return result.rows[0]?.payload_json ?? null;
  }

  async upsertSessionSummary(summary: SessionSummary): Promise<void> {
    await this.pool.query(
      `
      INSERT INTO learning_session_summaries (
        session_id,
        child_id,
        topic_id,
        ended_at,
        summary_json,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5::jsonb, NOW(), NOW())
      ON CONFLICT (session_id)
      DO UPDATE SET
        child_id = EXCLUDED.child_id,
        topic_id = EXCLUDED.topic_id,
        ended_at = EXCLUDED.ended_at,
        summary_json = EXCLUDED.summary_json,
        updated_at = NOW()
      `,
      [
        summary.sessionId,
        summary.childId,
        summary.topicId,
        summary.endedAt,
        JSON.stringify(summary)
      ]
    );
  }

  async listRecentSessionSummaries(childId: string, limit: number): Promise<SessionSummary[]> {
    const result = await this.pool.query<JsonRow<SessionSummary>>(
      `
      SELECT summary_json AS payload_json
      FROM learning_session_summaries
      WHERE child_id = $1
      ORDER BY ended_at DESC, updated_at DESC
      LIMIT $2
      `,
      [childId, limit]
    );

    return result.rows.map((row) => row.payload_json);
  }

  async getLearningSnapshot(childId: string): Promise<LearningSnapshot | null> {
    const result = await this.pool.query<JsonRow<LearningSnapshot>>(
      `
      SELECT snapshot_json AS payload_json
      FROM learning_snapshots
      WHERE child_id = $1
      `,
      [childId]
    );

    return result.rows[0]?.payload_json ?? null;
  }

  async saveLearningSnapshot(snapshot: LearningSnapshot): Promise<void> {
    await this.pool.query(
      `
      INSERT INTO learning_snapshots (
        child_id,
        snapshot_json,
        updated_at
      )
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (child_id)
      DO UPDATE SET
        snapshot_json = EXCLUDED.snapshot_json,
        updated_at = NOW()
      `,
      [snapshot.childId, JSON.stringify(snapshot)]
    );
  }

  async getLearnerProfile(childId: string): Promise<LearnerProfile | null> {
    const result = await this.pool.query<JsonRow<LearnerProfile>>(
      `
      SELECT profile_json AS payload_json
      FROM learner_profiles
      WHERE child_id = $1
      `,
      [childId]
    );

    return result.rows[0]?.payload_json ?? null;
  }

  async saveLearnerProfile(profile: LearnerProfile): Promise<void> {
    await this.pool.query(
      `
      INSERT INTO learner_profiles (
        child_id,
        profile_json,
        updated_at
      )
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (child_id)
      DO UPDATE SET
        profile_json = EXCLUDED.profile_json,
        updated_at = NOW()
      `,
      [profile.childId, JSON.stringify(profile)]
    );
  }
}
