import { env } from "../config/env.js";
import { FileLearningMemoryRepository } from "../storage/learningMemoryRepository.js";
import { InMemoryProfileRepository } from "../storage/profileRepository.js";
import { FileSessionStore } from "../storage/sessionStore.js";
import { InMemoryTopicRepository } from "../storage/topicRepository.js";
import { closePostgresPool, getPostgresPool } from "../storage/postgres/client.js";
import { PostgresLearningMemoryRepository } from "../storage/postgres/learningMemoryRepository.js";
import { PostgresProfileRepository } from "../storage/postgres/profileRepository.js";
import { PostgresSessionRepository } from "../storage/postgres/sessionRepository.js";
import { PostgresTopicRepository } from "../storage/postgres/topicRepository.js";
import { closeRedisClient, getRedisClient } from "../storage/redis/client.js";
import { RedisSessionStore } from "../storage/redis/redisSessionStore.js";
import { SessionStateManager } from "../storage/sessionStateManager.js";
import type { ChildContext, SessionWrapup, TopicContext } from "../types/session.js";
import type { LearnerProfile, LearningSnapshot, SessionSummary } from "../types/session.js";

export interface AppContainer {
  profileRepository: {
    getChildContext(childId: string): Promise<ChildContext>;
  };
  topicRepository: {
    getTopicContext(topicId: string): Promise<TopicContext>;
  };
  sessionRepository: {
    createSession(params: {
      sessionId: string;
      childId: string;
      topicId: string;
    }): Promise<void>;
    completeSession(wrapup: SessionWrapup): Promise<void>;
  };
  sessionStateManager: SessionStateManager;
  learningMemoryRepository: {
    getSessionSummary(sessionId: string): Promise<SessionSummary | null>;
    upsertSessionSummary(summary: SessionSummary): Promise<void>;
    listRecentSessionSummaries(childId: string, limit: number): Promise<SessionSummary[]>;
    getLearningSnapshot(childId: string): Promise<LearningSnapshot | null>;
    saveLearningSnapshot(snapshot: LearningSnapshot): Promise<void>;
    getLearnerProfile(childId: string): Promise<LearnerProfile | null>;
    saveLearnerProfile(profile: LearnerProfile): Promise<void>;
  };
  shutdown(): Promise<void>;
}

export async function createContainer(): Promise<AppContainer> {
  if (env.mockStorage) {
    return {
      profileRepository: new InMemoryProfileRepository(),
      topicRepository: new InMemoryTopicRepository(),
      sessionRepository: new InMemorySessionRepository(),
      sessionStateManager: new SessionStateManager(new FileSessionStore()),
      learningMemoryRepository: new FileLearningMemoryRepository(),
      shutdown: async () => {}
    };
  }

  const pool = getPostgresPool();
  const redis = getRedisClient();

  if (!redis.isOpen) {
    await redis.connect();
  }

  return {
    profileRepository: new PostgresProfileRepository(pool),
    topicRepository: new PostgresTopicRepository(pool),
    sessionRepository: new PostgresSessionRepository(pool),
    sessionStateManager: new SessionStateManager(new RedisSessionStore(redis)),
    learningMemoryRepository: new PostgresLearningMemoryRepository(pool),
    shutdown: async () => {
      const errors: Error[] = [];

      try {
        await closeRedisClient();
      } catch (error: unknown) {
        errors.push(error instanceof Error ? error : new Error(String(error)));
      }

      try {
        await closePostgresPool();
      } catch (error: unknown) {
        errors.push(error instanceof Error ? error : new Error(String(error)));
      }

      if (errors.length > 0) {
        throw new AggregateError(errors, "Failed to shut down backend resources");
      }
    }
  };
}

class InMemorySessionRepository {
  async createSession(_params: {
    sessionId: string;
    childId: string;
    topicId: string;
  }): Promise<void> {
    return;
  }

  async completeSession(_wrapup: SessionWrapup): Promise<void> {
    return;
  }
}
