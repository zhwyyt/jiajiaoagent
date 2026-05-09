import type { TopicContext } from "../types/session.js";

export function loadTopicContext(topicId: string): TopicContext {
  return {
    topicId,
    title: topicId.replace(/-/g, " "),
    keyPatterns: ["I like ...", "This is my ..."],
    completionSignals: ["child gives at least one full sentence"]
  };
}
