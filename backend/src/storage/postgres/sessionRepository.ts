import type { Pool } from "pg";
import type { SessionWrapup } from "../../types/session.js";

export class PostgresSessionRepository {
  constructor(private readonly pool: Pool) {}

  async createSession(params: {
    sessionId: string;
    childId: string;
    topicId: string;
  }): Promise<void> {
    await this.pool.query(
      `
      INSERT INTO sessions (
        id,
        child_id,
        topic_id,
        status,
        started_at,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())
      `,
      [params.sessionId, params.childId, params.topicId, "started"]
    );
  }

  async completeSession(wrapup: SessionWrapup): Promise<void> {
    await this.pool.query(
      `
      UPDATE sessions
      SET
        status = $2,
        topic_completed = $3,
        next_practice_hints = $4::jsonb,
        ended_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
      `,
      [
        wrapup.sessionId,
        "completed",
        wrapup.topicCompleted,
        JSON.stringify(wrapup.nextPracticeHints)
      ]
    );
  }
}
