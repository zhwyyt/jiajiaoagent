import type {
  LearnerProfile,
  LearningPlan,
  TopicContext,
  TurnRequest,
  TurnStrategy
} from "../types/session.js";

export function decideTurnStrategy(
  request: TurnRequest,
  topicContext: TopicContext,
  learningPlan?: LearningPlan,
  learnerProfile?: LearnerProfile | null
): TurnStrategy {
  const utterance = request.childUtteranceText.trim();
  const words = utterance.split(/\s+/).filter(Boolean);
  const containsChinese = /[\u4e00-\u9fff]/.test(utterance);
  const shortAnswer = words.length <= 2;
  const isQuestion = /\?$/.test(utterance) || /^(what|who|where|when|why|how|do|does|did|can|are|is)\b/i.test(utterance);
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
  const inWarmupPhase = request.turnIndex <= 2;
  const plannedStageGoal = learningPlan?.stageGoal;
  const plannedMove =
    plannedStageGoal === "simple-reasoning"
      ? "reason"
      : plannedStageGoal === "add-one-more-detail"
        ? "detail"
        : activeMove;
  const shouldKeepPressureLow = plannedStageGoal === "opening-confidence";
  const comprehensionSupportMode = inferComprehensionSupportMode(request, learningPlan);
  const profilePrefersChatFirst = learnerProfile?.stableTraits.preferredEntryStyle === "free-chat-first";
  const profilePressureSensitive = learnerProfile?.stableTraits.pressureSensitivity === "high";

  if (shouldKeepPressureLow) {
    return {
      correctionEnabled: false,
      correctionFocus: null,
      promptHint: learningPlan?.sessionGoal ?? "We can go slowly. One short sentence is okay.",
      shouldWrapUp: false,
      replyMode: inWarmupPhase || profilePrefersChatFirst ? "open-chat" : "expand-answer",
      speakingMove: "choice",
      comprehensionSupportMode,
      stageGoal: learningPlan?.stageGoal,
      weeklyFocus: learningPlan?.weeklyFocus,
      sessionGoal: learningPlan?.sessionGoal,
      supportLevel: learningPlan?.supportLevel,
      correctionMode: learningPlan?.correctionMode
    };
  }

  if ((inWarmupPhase || profilePrefersChatFirst) && (isQuestion || words.length >= 3 || containsChinese)) {
    return {
      correctionEnabled: false,
      correctionFocus: null,
      promptHint: null,
      shouldWrapUp: false,
      replyMode: "open-chat",
      speakingMove: "description",
      comprehensionSupportMode,
      stageGoal: learningPlan?.stageGoal,
      weeklyFocus: learningPlan?.weeklyFocus,
      sessionGoal: learningPlan?.sessionGoal,
      supportLevel: learningPlan?.supportLevel,
      correctionMode: learningPlan?.correctionMode
    };
  }

  if (containsChinese) {
    return {
      correctionEnabled: false,
      correctionFocus: "language-bridge",
      promptHint:
        "If you forget one word, you can say it in Chinese first. Then say the whole sentence in English.",
      shouldWrapUp: false,
      replyMode: profilePressureSensitive ? "open-chat" : "expand-answer",
      speakingMove: "description",
      comprehensionSupportMode,
      stageGoal: learningPlan?.stageGoal,
      weeklyFocus: learningPlan?.weeklyFocus,
      sessionGoal: learningPlan?.sessionGoal,
      supportLevel: learningPlan?.supportLevel,
      correctionMode: learningPlan?.correctionMode
    };
  }

  if (shortAnswer) {
    return {
      correctionEnabled: false,
      correctionFocus: null,
      promptHint: learningPlan?.sessionGoal ?? buildPromptHintForMove(plannedMove, topicContext),
      shouldWrapUp: false,
      replyMode: "expand-answer",
      speakingMove: profilePressureSensitive ? "choice" : plannedMove,
      comprehensionSupportMode,
      stageGoal: learningPlan?.stageGoal,
      weeklyFocus: learningPlan?.weeklyFocus,
      sessionGoal: learningPlan?.sessionGoal,
      supportLevel: learningPlan?.supportLevel,
      correctionMode: learningPlan?.correctionMode
    };
  }

  if (!looksLikeFullSentence) {
    return {
      correctionEnabled: learningPlan?.correctionMode !== "minimal" && !profilePressureSensitive,
      correctionFocus: "sentence-starter",
      promptHint: learningPlan?.sessionGoal ?? buildPromptHintForMove(plannedMove, topicContext),
      shouldWrapUp: false,
      replyMode: "expand-answer",
      speakingMove: plannedMove,
      comprehensionSupportMode,
      stageGoal: learningPlan?.stageGoal,
      weeklyFocus: learningPlan?.weeklyFocus,
      sessionGoal: learningPlan?.sessionGoal,
      supportLevel: learningPlan?.supportLevel,
      correctionMode: learningPlan?.correctionMode
    };
  }

  return {
    correctionEnabled: plannedMove === "reason" && !hasReasonWord,
    correctionFocus:
      plannedMove === "reason" && !hasReasonWord
        ? "add-reason"
        : !mentionsFamilyMember && topicContext.topicId === "my-family"
          ? "topic-vocabulary"
          : null,
    promptHint: learningPlan?.sessionGoal ?? null,
    shouldWrapUp: request.turnIndex >= 6,
    replyMode: "follow-up",
    speakingMove: plannedMove,
    comprehensionSupportMode,
    stageGoal: learningPlan?.stageGoal,
    weeklyFocus: learningPlan?.weeklyFocus,
    sessionGoal: learningPlan?.sessionGoal,
    supportLevel: learningPlan?.supportLevel,
    correctionMode: learningPlan?.correctionMode
  };
}

function inferComprehensionSupportMode(
  request: TurnRequest,
  learningPlan?: LearningPlan
): TurnStrategy["comprehensionSupportMode"] {
  const utterance = request.childUtteranceText.trim();
  const lower = utterance.toLowerCase();
  const containsChinese = /[\u4e00-\u9fff]/.test(utterance);
  const asksForChineseHelp =
    /(中文|汉语|翻译|什么意思|没听懂|听不懂|不会说|不知道怎么说)/u.test(utterance) ||
    /\b(i don't understand|i dont understand|what does it mean|can you say it in chinese)\b/i.test(lower);
  const signalsStuck =
    /(不会|不知道|说不出来|不想说)/u.test(utterance) ||
    /\b(i don't know|i dont know|i can't say it|i cant say it|i can't speak|i cant speak)\b/i.test(lower);

  if (containsChinese) {
    return "chinese-bridge-to-english";
  }

  if (asksForChineseHelp || signalsStuck || learningPlan?.supportLevel === "high-support") {
    return "english-with-chinese-support";
  }

  return "english-only";
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
