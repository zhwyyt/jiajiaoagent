import type { ActiveSessionState } from "../types/session.js";

export interface SessionStore {
  get(sessionId: string): Promise<ActiveSessionState | null>;
  set(session: ActiveSessionState): Promise<void>;
}

export class InMemorySessionStore implements SessionStore {
  private sessions = new Map<string, ActiveSessionState>();

  async get(sessionId: string): Promise<ActiveSessionState | null> {
    return this.sessions.get(sessionId) ?? null;
  }

  async set(session: ActiveSessionState): Promise<void> {
    this.sessions.set(session.sessionId, session);
  }
}
