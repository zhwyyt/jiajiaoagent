import fs from "node:fs";
import path from "node:path";
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

interface FileSessionStoreState {
  sessions: ActiveSessionState[];
}

const DEFAULT_SESSION_STORE_FILE = path.resolve(process.cwd(), ".session-store.json");

export class FileSessionStore implements SessionStore {
  constructor(private readonly filePath: string = DEFAULT_SESSION_STORE_FILE) {}

  async get(sessionId: string): Promise<ActiveSessionState | null> {
    return this.readState().sessions.find((session) => session.sessionId === sessionId) ?? null;
  }

  async set(session: ActiveSessionState): Promise<void> {
    const state = this.readState();
    const nextSessions = state.sessions.filter((item) => item.sessionId !== session.sessionId);
    nextSessions.push(session);
    this.writeState({
      sessions: nextSessions
    });
  }

  private readState(): FileSessionStoreState {
    try {
      if (!fs.existsSync(this.filePath)) {
        return { sessions: [] };
      }
      const raw = fs.readFileSync(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as Partial<FileSessionStoreState>;
      return {
        sessions: parsed.sessions ?? []
      };
    } catch {
      return { sessions: [] };
    }
  }

  private writeState(state: FileSessionStoreState): void {
    fs.writeFileSync(this.filePath, JSON.stringify(state, null, 2), "utf8");
  }
}
