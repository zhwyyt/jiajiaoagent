import type { Pool } from "pg";
import type { TopicContext } from "../../types/session.js";

export class PostgresTopicRepository {
  constructor(private readonly pool: Pool) {}

  async getTopicContext(topicId: string): Promise<TopicContext> {
    const result = await this.pool.query(
      `
      SELECT id, title, key_patterns, completion_signals
      FROM topics
      WHERE id = $1
      `,
      [topicId]
    );

    if (result.rowCount === 0) {
      return {
        topicId,
        title: topicId.replace(/-/g, " "),
        keyPatterns: ["I like ...", "This is my ..."],
        completionSignals: ["child gives at least one full sentence"]
      };
    }

    const row = result.rows[0] as {
      id: string;
      title: string;
      key_patterns: string[];
      completion_signals: string[];
    };

    return {
      topicId: row.id,
      title: row.title,
      keyPatterns: row.key_patterns,
      completionSignals: row.completion_signals
    };
  }
}
