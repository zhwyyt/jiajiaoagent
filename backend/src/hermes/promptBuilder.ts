import type {
  ChildContext,
  TopicContext,
  TurnRequest,
  TurnStrategy
} from "../types/session.js";

export function buildPromptPayload(
  request: TurnRequest,
  strategy: TurnStrategy,
  childContext: ChildContext,
  topicContext: TopicContext
) {
  const fallbackReplyText = buildFallbackReplyText(
    request,
    strategy,
    childContext,
    topicContext
  );

  return {
    topicId: request.topicId,
    replyMode: strategy.replyMode,
    fallbackReplyText,
    childLevel: childContext.currentSpeakingLevel
  };
}

function buildFallbackReplyText(
  request: TurnRequest,
  strategy: TurnStrategy,
  childContext: ChildContext,
  topicContext: TopicContext
): string {
  const utterance = request.childUtteranceText.trim();
  const lowerText = utterance.toLowerCase();
  const wordCount = utterance.split(/\s+/).filter(Boolean).length;
  const encouragingLead = childContext.encouragementStyle === "lively" ? "Awesome!" : "Good job!";
  const familyMembers = [
    "mother",
    "mom",
    "mum",
    "father",
    "dad",
    "sister",
    "brother",
    "grandma",
    "grandmother",
    "grandpa",
    "grandfather"
  ];
  const mentionedFamilyMember = familyMembers.find((member) => lowerText.includes(member));

  if (strategy.replyMode === "expand-answer") {
    if (strategy.correctionFocus === "sentence-starter") {
      return `${encouragingLead} Try this pattern: "My ... is ..." or "I have ...". Can you say it again?`;
    }

    if (wordCount <= 2) {
      return `${encouragingLead} Please say one full sentence about your family. You can say, "My mother is kind."`;
    }
  }

  if (mentionedFamilyMember) {
    return `${encouragingLead} You talked about your ${mentionedFamilyMember}. What does your ${mentionedFamilyMember} like to do?`;
  }

  if (lowerText.includes("i have")) {
    return `${encouragingLead} Can you add one more detail about that person? For example, tell me the name, age, or hobby.`;
  }

  if (/\b(he|she)\s+is\b/.test(lowerText)) {
    return `${encouragingLead} Nice describing sentence. Can you tell me one thing you do with your family?`;
  }

  if (request.turnIndex >= 5) {
    return `You are doing well. Please use two sentences to tell me who is in your family and what you like to do together.`;
  }

  return `${encouragingLead} Tell me a little more about ${topicContext.title}. Use one or two simple sentences.`;
}
