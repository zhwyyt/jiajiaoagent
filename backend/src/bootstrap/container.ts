import { env } from "../config/env.js";
import { InMemoryProfileRepository } from "../storage/profileRepository.js";
import { InMemorySessionStore } from "../storage/sessionStore.js";
import { InMemoryTopicRepository } from "../storage/topicRepository.js";
import { getPostgresPool } from "../storage/postgres/client.js";
import { PostgresProfileRepository } from "../storage/postgres/profileRepository.js";
import { PostgresSessionRepository } from "../storage/postgres/sessionRepository.js";
import { PostgresTopicRepository } from "../storage/postgres/topicRepository.js";
import { getRedisClient } from "../storage/redis/client.js";
import { RedisSessionStore } from "../storage/redis/redisSessionStore.js";
import { SessionStateManager } from "../storage/sessionStateManager.js";
import type { ChildContext, SessionWrapup, TopicContext } from "../types/session.js";

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
}

export async function createContainer(): Promise<AppContainer> {
  if (env.mockStorage) {
    return {
      profileRepository: new InMemoryProfileRepository(),
      topicRepository: new InMemoryTopicRepository(),
      sessionRepository: new InMemorySessionRepository(),
      sessionStateManager: new SessionStateManager(new InMemorySessionStore())
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
    sessionStateManager: new SessionStateManager(new RedisSessionStore(redis))
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
