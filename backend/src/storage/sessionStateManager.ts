import type { ActiveSessionState } from "../types/session.js";
import { sessionKey } from "./redisKeys.js";
import type { SessionStore } from "./sessionStore.js";

export class SessionStateManager {
  constructor(private readonly sessionStore: SessionStore) {}

  async load(sessionId: string): Promise<ActiveSessionState | null> {
    return this.sessionStore.get(sessionId);
  }

  async save(state: ActiveSessionState): Promise<void> {
    await this.sessionStore.set(state);
  }

  buildKey(sessionId: string): string {
    return sessionKey(sessionId);
  }
}
