import type { TopicContext, TurnRequest, TurnStrategy } from "../types/session.js";

export function decideTurnStrategy(
  request: TurnRequest,
  topicContext: TopicContext
): TurnStrategy {
  const utterance = request.childUtteranceText.trim();
  const words = utterance.split(/\s+/).filter(Boolean);
  const containsChinese = /[\u4e00-\u9fff]/.test(utterance);
  const shortAnswer = words.length <= 2;
  const sentenceStarterPattern = /^(i|my|this|he|she|we|they)\b/i;
  const looksLikeFullSentence = words.length >= 3 && sentenceStarterPattern.test(utterance);
  const activeMove =
    topicContext.speakingMoves[(Math.max(request.turnIndex, 1) - 1) % Math.max(topicContext.speakingMoves.length, 1)] ??
    "detail";
  const mentionsFamilyMember =
    /\b(mother|mom|mum|father|dad|sister|brother|grandma|grandmother|grandpa|grandfather|family)\b/i.test(
      utterance
    );
  const hasReasonWord = /\b(because|so)\b/i.test(utterance);

  if (containsChinese) {
    return {
      correctionEnabled: false,
      correctionFocus: "language-bridge",
      promptHint:
        "If you forget one word, you can say it in Chinese first. Then say the whole sentence in English.",
      shouldWrapUp: false,
      replyMode: "expand-answer",
      speakingMove: "description"
    };
  }

  if (shortAnswer) {
    return {
      correctionEnabled: false,
      correctionFocus: null,
      promptHint: buildPromptHintForMove(activeMove, topicContext),
      shouldWrapUp: false,
      replyMode: "expand-answer",
      speakingMove: activeMove
    };
  }

  if (!looksLikeFullSentence) {
    return {
      correctionEnabled: true,
      correctionFocus: "sentence-starter",
      promptHint: buildPromptHintForMove(activeMove, topicContext),
      shouldWrapUp: false,
      replyMode: "expand-answer",
      speakingMove: activeMove
    };
  }

  return {
    correctionEnabled: activeMove === "reason" && !hasReasonWord,
    correctionFocus:
      activeMove === "reason" && !hasReasonWord
        ? "add-reason"
        : !mentionsFamilyMember && topicContext.topicId === "my-family"
          ? "topic-vocabulary"
          : null,
    promptHint: null,
    shouldWrapUp: request.turnIndex >= 6,
    replyMode: "follow-up",
    speakingMove: activeMove
  };
}

function buildPromptHintForMove(
  speakingMove: TurnStrategy["speakingMove"],
  topicContext: TopicContext
): string {
  const starter = topicContext.sentenceStarters[0] ?? "I like ...";

  switch (speakingMove) {
    case "choice":
      return topicContext.eitherOrPrompts[0] ?? `Try a full sentence like "${starter}".`;
    case "reason":
      return `Try a reason sentence like "${topicContext.sentenceStarters[2] ?? `${starter} because ...`}".`;
    case "detail":
      return "Add one more detail in a full sentence.";
    case "description":
      return `Try a full sentence like "${starter}".`;
    case "naming":
      return `Name it first, then say a full sentence like "${starter}".`;
    case "feeling":
      return `Say how you feel in a full sentence like "${starter}".`;
    default:
      return `Try a full sentence like "${starter}".`;
  }
}
