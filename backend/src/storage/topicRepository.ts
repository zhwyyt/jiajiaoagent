import type { TopicContext } from "../types/session.js";

export interface TopicRepository {
  getTopicContext(topicId: string): Promise<TopicContext>;
}

export class InMemoryTopicRepository implements TopicRepository {
  async getTopicContext(topicId: string): Promise<TopicContext> {
    return {
      topicId,
      title: topicId.replace(/-/g, " "),
      keyPatterns: ["I like ...", "This is my ..."],
      completionSignals: ["child gives at least one full sentence"]
    };
  }
}
