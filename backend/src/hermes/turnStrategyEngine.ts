import type { TurnRequest, TurnStrategy } from "../types/session.js";

export function decideTurnStrategy(request: TurnRequest): TurnStrategy {
  const utterance = request.childUtteranceText.trim();
  const words = utterance.split(/\s+/).filter(Boolean);
  const shortAnswer = words.length <= 2;
  const sentenceStarterPattern = /^(i|my|this|he|she|we|they)\b/i;
  const looksLikeFullSentence = words.length >= 4 && sentenceStarterPattern.test(utterance);
  const mentionsFamilyMember =
    /\b(mother|mom|mum|father|dad|sister|brother|grandma|grandmother|grandpa|grandfather|family)\b/i.test(
      utterance
    );

  if (shortAnswer) {
    return {
      correctionEnabled: false,
      correctionFocus: null,
      promptHint: "Try a full sentence with I, my, or this is.",
      shouldWrapUp: false,
      replyMode: "expand-answer"
    };
  }

  if (!looksLikeFullSentence) {
    return {
      correctionEnabled: true,
      correctionFocus: "sentence-starter",
      promptHint: "Start with I, my, or this is.",
      shouldWrapUp: false,
      replyMode: "expand-answer"
    };
  }

  return {
    correctionEnabled: !mentionsFamilyMember,
    correctionFocus: mentionsFamilyMember ? null : "topic-vocabulary",
    promptHint: null,
    shouldWrapUp: request.turnIndex >= 6,
    replyMode: "follow-up"
  };
}
