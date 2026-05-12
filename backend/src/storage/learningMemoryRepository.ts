import fs from "node:fs";
import path from "node:path";
import type {
  LearnerProfile,
  LearningSnapshot,
  SessionSummary
} from "../types/session.js";

export interface LearningMemoryRepository {
  getSessionSummary(sessionId: string): Promise<SessionSummary | null>;
  upsertSessionSummary(summary: SessionSummary): Promise<void>;
  listRecentSessionSummaries(childId: string, limit: number): Promise<SessionSummary[]>;
  getLearningSnapshot(childId: string): Promise<LearningSnapshot | null>;
  saveLearningSnapshot(snapshot: LearningSnapshot): Promise<void>;
  getLearnerProfile(childId: string): Promise<LearnerProfile | null>;
  saveLearnerProfile(profile: LearnerProfile): Promise<void>;
}

export class InMemoryLearningMemoryRepository implements LearningMemoryRepository {
  private readonly sessionSummaries = new Map<string, SessionSummary>();
  private readonly snapshotsByChildId = new Map<string, LearningSnapshot>();
  private readonly profilesByChildId = new Map<string, LearnerProfile>();

  async getSessionSummary(sessionId: string): Promise<SessionSummary | null> {
    return this.sessionSummaries.get(sessionId) ?? null;
  }

  async upsertSessionSummary(summary: SessionSummary): Promise<void> {
    this.sessionSummaries.set(summary.sessionId, summary);
  }

  async listRecentSessionSummaries(childId: string, limit: number): Promise<SessionSummary[]> {
    return [...this.sessionSummaries.values()]
      .filter((summary) => summary.childId === childId)
      .sort((left, right) => right.endedAt.localeCompare(left.endedAt))
      .slice(0, limit);
  }

  async getLearningSnapshot(childId: string): Promise<LearningSnapshot | null> {
    return this.snapshotsByChildId.get(childId) ?? null;
  }

  async saveLearningSnapshot(snapshot: LearningSnapshot): Promise<void> {
    this.snapshotsByChildId.set(snapshot.childId, snapshot);
  }

  async getLearnerProfile(childId: string): Promise<LearnerProfile | null> {
    return this.profilesByChildId.get(childId) ?? null;
  }

  async saveLearnerProfile(profile: LearnerProfile): Promise<void> {
    this.profilesByChildId.set(profile.childId, profile);
  }
}

interface FileLearningMemoryState {
  sessionSummaries: SessionSummary[];
  snapshots: LearningSnapshot[];
  learnerProfiles: LearnerProfile[];
}

const DEFAULT_LEARNING_MEMORY_FILE = path.resolve(process.cwd(), ".learning-memory.json");

export class FileLearningMemoryRepository implements LearningMemoryRepository {
  constructor(private readonly filePath: string = DEFAULT_LEARNING_MEMORY_FILE) {}

  async getSessionSummary(sessionId: string): Promise<SessionSummary | null> {
    return this.readState().sessionSummaries.find((summary) => summary.sessionId === sessionId) ?? null;
  }

  async upsertSessionSummary(summary: SessionSummary): Promise<void> {
    const state = this.readState();
    const nextSummaries = upsertByKey(state.sessionSummaries, summary, (item) => item.sessionId);
    this.writeState({
      ...state,
      sessionSummaries: nextSummaries
    });
  }

  async listRecentSessionSummaries(childId: string, limit: number): Promise<SessionSummary[]> {
    return this.readState().sessionSummaries
      .filter((summary) => summary.childId === childId)
      .sort((left, right) => right.endedAt.localeCompare(left.endedAt))
      .slice(0, limit);
  }

  async getLearningSnapshot(childId: string): Promise<LearningSnapshot | null> {
    return this.readState().snapshots.find((snapshot) => snapshot.childId === childId) ?? null;
  }

  async saveLearningSnapshot(snapshot: LearningSnapshot): Promise<void> {
    const state = this.readState();
    this.writeState({
      ...state,
      snapshots: upsertByKey(state.snapshots, snapshot, (item) => item.childId)
    });
  }

  async getLearnerProfile(childId: string): Promise<LearnerProfile | null> {
    return this.readState().learnerProfiles.find((profile) => profile.childId === childId) ?? null;
  }

  async saveLearnerProfile(profile: LearnerProfile): Promise<void> {
    const state = this.readState();
    this.writeState({
      ...state,
      learnerProfiles: upsertByKey(state.learnerProfiles, profile, (item) => item.childId)
    });
  }

  private readState(): FileLearningMemoryState {
    try {
      if (!fs.existsSync(this.filePath)) {
        return {
          sessionSummaries: [],
          snapshots: [],
          learnerProfiles: []
        };
      }
      const raw = fs.readFileSync(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as Partial<FileLearningMemoryState>;
      return {
        sessionSummaries: parsed.sessionSummaries ?? [],
        snapshots: parsed.snapshots ?? [],
        learnerProfiles: parsed.learnerProfiles ?? []
      };
    } catch {
      return {
        sessionSummaries: [],
        snapshots: [],
        learnerProfiles: []
      };
    }
  }

  private writeState(state: FileLearningMemoryState): void {
    fs.writeFileSync(this.filePath, JSON.stringify(state, null, 2), "utf8");
  }
}

function upsertByKey<T>(items: T[], nextItem: T, getKey: (item: T) => string): T[] {
  const targetKey = getKey(nextItem);
  const nextItems = items.filter((item) => getKey(item) !== targetKey);
  nextItems.push(nextItem);
  return nextItems;
}
