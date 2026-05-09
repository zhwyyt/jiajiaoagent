import type { Pool } from "pg";
import type { ChildContext } from "../../types/session.js";

export class PostgresProfileRepository {
  constructor(private readonly pool: Pool) {}

  async getChildContext(childId: string): Promise<ChildContext> {
    const result = await this.pool.query(
      `
      SELECT id, english_level, confidence_level
      FROM children
      WHERE id = $1
      `,
      [childId]
    );

    if (result.rowCount === 0) {
      return {
        childId,
        currentSpeakingLevel: 2,
        focusAreas: ["full sentences"],
        encouragementStyle: "gentle"
      };
    }

    const row = result.rows[0] as {
      id: string;
      english_level: number;
      confidence_level: string | null;
    };

    return {
      childId: row.id,
      currentSpeakingLevel: row.english_level,
      focusAreas: ["full sentences"],
      encouragementStyle: row.confidence_level === "high" ? "lively" : "gentle"
    };
  }
}
