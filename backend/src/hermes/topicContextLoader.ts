import type { TopicContext } from "../types/session.js";
import { getTopicContextById } from "../storage/topicPack.js";

export function loadTopicContext(topicId: string): TopicContext {
  return getTopicContextById(topicId);
}
