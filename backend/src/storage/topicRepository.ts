import type { TopicContext } from "../types/session.js";
import { getTopicContextById } from "./topicPack.js";

export interface TopicRepository {
  getTopicContext(topicId: string): Promise<TopicContext>;
}

export class InMemoryTopicRepository implements TopicRepository {
  async getTopicContext(topicId: string): Promise<TopicContext> {
    return getTopicContextById(topicId);
  }
}
