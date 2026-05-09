import type { RedisClientType } from "redis";
import type { ActiveSessionState } from "../../types/session.js";
import { sessionKey } from "../redisKeys.js";
import type { SessionStore } from "../sessionStore.js";

const SESSION_TTL_SECONDS = 2 * 60 * 60;

export class RedisSessionStore implements SessionStore {
  constructor(private readonly client: RedisClientType) {}

  async get(sessionId: string): Promise<ActiveSessionState | null> {
    const raw = await this.client.get(sessionKey(sessionId));
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as ActiveSessionState;
  }

  async set(session: ActiveSessionState): Promise<void> {
    await this.client.set(sessionKey(session.sessionId), JSON.stringify(session), {
      EX: SESSION_TTL_SECONDS
    });
  }
}
