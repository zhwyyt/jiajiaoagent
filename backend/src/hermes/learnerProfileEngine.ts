import type {
  LearnerProfile,
  LearningBottleneckTag,
  LearningSnapshot,
  LearningStrengthTag,
  SessionSummary
} from "../types/session.js";

export function buildLearnerProfile(params: {
  snapshot: LearningSnapshot;
  recentSummaries: SessionSummary[];
  previousProfile?: LearnerProfile | null;
}): LearnerProfile {
  const { snapshot, recentSummaries, previousProfile } = params;
  const topBottleneck = snapshot.topBottlenecks[0] ?? null;
  const candidateTraits = inferCandidateStableTraits(snapshot, recentSummaries);
  const stableTraits = resolveStableTraitsSlowly({
    snapshot,
    recentSummaries,
    previousProfile,
    candidateTraits
  });
  const recentStrengths = describeRecentStrengths(snapshot.topStrengths);
  const recentBottlenecks = describeRecentBottlenecks(snapshot.topBottlenecks);
  const recentShiftSummary = describeRecentShift(snapshot);
  const recentConversationStyle = describeRecentConversationStyle(snapshot, recentSummaries);
  const recentComprehensionPattern = describeRecentComprehensionPattern(snapshot);
  const activeSupports = buildActiveSupports({
    snapshot,
    preferredEntryStyle: stableTraits.preferredEntryStyle,
    pressureSensitivity: stableTraits.pressureSensitivity,
    cnSupportNeed: stableTraits.cnSupportNeed
  });
  const currentHypothesis = buildCurrentHypothesis({
    openingWillingness: stableTraits.openingWillingness,
    pressureSensitivity: stableTraits.pressureSensitivity,
    preferredEntryStyle: stableTraits.preferredEntryStyle,
    topBottleneck,
    snapshot
  });

  return {
    childId: snapshot.childId,
    profileVersion: "v1",
    lastUpdatedAt: new Date().toISOString(),
    stableTraits,
    currentStage: {
      stageGoal: snapshot.currentStageGoal,
      stageConfidence: inferStageConfidence(snapshot),
      mainGrowthTarget: buildMainGrowthTarget(topBottleneck, snapshot.currentStageGoal)
    },
    recentSignals: {
      recentStrengths,
      recentBottlenecks,
      recentShiftSummary,
      recentConversationStyle,
      recentComprehensionPattern
    },
    activeSupports,
    currentHypothesis
  };
}

function inferCandidateStableTraits(
  snapshot: LearningSnapshot,
  recentSummaries: SessionSummary[]
): LearnerProfile["stableTraits"] {
  return {
    openingWillingness: inferOpeningWillingness(snapshot, recentSummaries),
    pressureSensitivity: inferPressureSensitivity(snapshot, recentSummaries),
    preferredEntryStyle: inferPreferredEntryStyle(snapshot, recentSummaries),
    cnSupportNeed: inferCnSupportNeed(snapshot),
    preferredScaffold: inferPreferredScaffold(snapshot)
  };
}

function resolveStableTraitsSlowly(params: {
  snapshot: LearningSnapshot;
  recentSummaries: SessionSummary[];
  previousProfile?: LearnerProfile | null;
  candidateTraits: LearnerProfile["stableTraits"];
}): LearnerProfile["stableTraits"] {
  const previousTraits = params.previousProfile?.stableTraits;
  if (!previousTraits) {
    return params.candidateTraits;
  }

  return {
    openingWillingness: slowUpdateOrderedTrait({
      previous: previousTraits.openingWillingness,
      candidate: params.candidateTraits.openingWillingness,
      order: ["low", "medium", "high"],
      canChange: canChangeOpeningWillingness(params.snapshot, params.recentSummaries)
    }),
    pressureSensitivity: slowUpdateOrderedTrait({
      previous: previousTraits.pressureSensitivity,
      candidate: params.candidateTraits.pressureSensitivity,
      order: ["low", "medium", "high"],
      canChange: canChangePressureSensitivity(params.snapshot, params.recentSummaries)
    }),
    preferredEntryStyle: slowUpdateEnumTrait({
      previous: previousTraits.preferredEntryStyle,
      candidate: params.candidateTraits.preferredEntryStyle,
      canChange: canChangePreferredEntryStyle(params.snapshot, params.recentSummaries)
    }),
    cnSupportNeed: slowUpdateOrderedTrait({
      previous: previousTraits.cnSupportNeed,
      candidate: params.candidateTraits.cnSupportNeed,
      order: ["rare", "occasional", "frequent"],
      canChange: canChangeCnSupportNeed(params.snapshot, params.recentSummaries)
    }),
    preferredScaffold: slowUpdateEnumTrait({
      previous: previousTraits.preferredScaffold,
      candidate: params.candidateTraits.preferredScaffold,
      canChange: canChangePreferredScaffold(params.snapshot, params.recentSummaries)
    })
  };
}

function inferOpeningWillingness(
  snapshot: LearningSnapshot,
  summaries: SessionSummary[]
): LearnerProfile["stableTraits"]["openingWillingness"] {
  const highEngagementCount = summaries.filter((summary) => summary.engagementLevel === "high").length;
  if (snapshot.recentSilenceRate >= 0.4) {
    return "low";
  }
  if (highEngagementCount >= 2 || snapshot.topStrengths.includes("willing_to_speak")) {
    return "high";
  }
  return "medium";
}

function inferPressureSensitivity(
  snapshot: LearningSnapshot,
  summaries: SessionSummary[]
): LearnerProfile["stableTraits"]["pressureSensitivity"] {
  if (snapshot.currentStageGoal === "opening-confidence" || snapshot.recentSilenceRate >= 0.4) {
    return "high";
  }
  if (
    snapshot.topBottlenecks.includes("afraid_to_speak") ||
    summaries.some((summary) => summary.engagementLevel === "low")
  ) {
    return "medium";
  }
  return "low";
}

function inferPreferredEntryStyle(
  snapshot: LearningSnapshot,
  summaries: SessionSummary[]
): LearnerProfile["stableTraits"]["preferredEntryStyle"] {
  const prefersSafeTopics = summaries.filter((summary) => summary.topicId === "my-family").length >= 2;
  if (snapshot.currentStageGoal === "opening-confidence" || prefersSafeTopics) {
    return "free-chat-first";
  }
  if (snapshot.currentStageGoal === "more-independent-speaking") {
    return "direct-practice-ok";
  }
  return "mixed";
}

function inferCnSupportNeed(
  snapshot: LearningSnapshot
): LearnerProfile["stableTraits"]["cnSupportNeed"] {
  if (snapshot.recentChineseBridgeRate >= 0.4) {
    return "frequent";
  }
  if (snapshot.recentChineseBridgeRate >= 0.15) {
    return "occasional";
  }
  return "rare";
}

function inferPreferredScaffold(
  snapshot: LearningSnapshot
): LearnerProfile["stableTraits"]["preferredScaffold"] {
  if (snapshot.topStrengths.includes("responds_well_to_choice_prompt")) {
    return "choice";
  }
  if (snapshot.topBottlenecks.includes("needs_sentence_starter")) {
    return "sentence-starter";
  }
  if (snapshot.currentStageGoal === "more-independent-speaking") {
    return "open-prompt";
  }
  return "mixed";
}

function inferStageConfidence(
  snapshot: LearningSnapshot
): LearnerProfile["currentStage"]["stageConfidence"] {
  if (snapshot.recentSessionsCount < 2) {
    return "low";
  }
  if (snapshot.recentSessionsCount >= 4 && snapshot.recentFullSentenceRate >= 0.5) {
    return "high";
  }
  return "medium";
}

function slowUpdateOrderedTrait<T extends string>(params: {
  previous: T;
  candidate: T;
  order: readonly T[];
  canChange: boolean;
}): T {
  if (params.previous === params.candidate) {
    return params.previous;
  }
  if (!params.canChange) {
    return params.previous;
  }

  const previousIndex = params.order.indexOf(params.previous);
  const candidateIndex = params.order.indexOf(params.candidate);
  if (previousIndex === -1 || candidateIndex === -1) {
    return params.previous;
  }

  if (Math.abs(candidateIndex - previousIndex) <= 1) {
    return params.candidate;
  }

  return params.order[previousIndex + Math.sign(candidateIndex - previousIndex)];
}

function slowUpdateEnumTrait<T extends string>(params: {
  previous: T;
  candidate: T;
  canChange: boolean;
}): T {
  if (params.previous === params.candidate) {
    return params.previous;
  }
  return params.canChange ? params.candidate : params.previous;
}

function canChangeOpeningWillingness(
  snapshot: LearningSnapshot,
  summaries: SessionSummary[]
): boolean {
  if (summaries.length < 3) {
    return false;
  }
  if (snapshot.recentSilenceRate >= 0.45 || snapshot.recentSilenceRate <= 0.15) {
    return true;
  }
  return summaries.filter((summary) => summary.engagementLevel === "high").length >= 2;
}

function canChangePressureSensitivity(
  snapshot: LearningSnapshot,
  summaries: SessionSummary[]
): boolean {
  if (summaries.length < 3) {
    return false;
  }
  if (snapshot.currentStageGoal === "opening-confidence" && snapshot.recentSilenceRate >= 0.3) {
    return true;
  }
  return summaries.filter((summary) => summary.engagementLevel === "low").length >= 2;
}

function canChangePreferredEntryStyle(
  snapshot: LearningSnapshot,
  summaries: SessionSummary[]
): boolean {
  if (summaries.length < 3) {
    return false;
  }
  if (snapshot.currentStageGoal === "opening-confidence") {
    return true;
  }
  const repeatedSafeTopic = summaries.filter((summary) => summary.topicId === "my-family").length >= 3;
  if (repeatedSafeTopic) {
    return true;
  }
  return snapshot.currentStageGoal === "more-independent-speaking" && snapshot.recentFullSentenceRate >= 0.55;
}

function canChangeCnSupportNeed(
  snapshot: LearningSnapshot,
  summaries: SessionSummary[]
): boolean {
  if (summaries.length < 3) {
    return false;
  }
  return snapshot.recentChineseBridgeRate >= 0.35 || snapshot.recentChineseBridgeRate <= 0.1;
}

function canChangePreferredScaffold(
  snapshot: LearningSnapshot,
  summaries: SessionSummary[]
): boolean {
  if (summaries.length < 3) {
    return false;
  }
  if (snapshot.topStrengths.includes("responds_well_to_choice_prompt")) {
    return true;
  }
  if (snapshot.topBottlenecks.includes("needs_sentence_starter")) {
    return true;
  }
  return snapshot.currentStageGoal === "more-independent-speaking" && snapshot.recentFullSentenceRate >= 0.6;
}

function buildMainGrowthTarget(
  bottleneck: LearningBottleneckTag | null,
  stageGoal: LearningSnapshot["currentStageGoal"]
): string {
  switch (bottleneck) {
    case "afraid_to_speak":
      return "keep the child willing to answer with low pressure";
    case "output_too_short":
    case "needs_sentence_starter":
      return "move from short replies toward fuller sentences";
    case "needs_cn_bridge":
      return "use Chinese bridge support, then turn the idea into simple English";
    case "cannot_extend_answer":
      return "help the child add one more small detail after the first answer";
    case "weak_reason_expression":
      return "gently invite one short because sentence when it fits";
    default:
      return stageGoal === "more-independent-speaking"
        ? "help the child carry a little more of the conversation alone"
        : "keep the next speaking step small and achievable";
  }
}

function describeRecentStrengths(strengths: LearningStrengthTag[]): string[] {
  return strengths.slice(0, 3).map((strength) => {
    switch (strength) {
      case "willing_to_speak":
        return "willing to keep interacting";
      case "accepts_retry":
        return "usually accepts another try";
      case "can_answer_in_full_sentence":
        return "can sometimes answer in fuller sentences";
      case "can_add_detail":
        return "can add extra detail";
      case "can_give_simple_reason":
        return "can give simple reasons";
      case "responds_well_to_choice_prompt":
        return "does well with simple either-or support";
      case "likes_topic_family":
        return "seems comfortable with family topic";
      case "likes_topic_food":
        return "seems comfortable with food topic";
    }
  });
}

function describeRecentBottlenecks(bottlenecks: LearningBottleneckTag[]): string[] {
  return bottlenecks.slice(0, 3).map((bottleneck) => {
    switch (bottleneck) {
      case "afraid_to_speak":
        return "confidence drops when speaking feels hard";
      case "output_too_short":
        return "answers still stop too quickly";
      case "needs_sentence_starter":
        return "often needs a sentence start to continue";
      case "needs_cn_bridge":
        return "still relies on Chinese bridge support";
      case "cannot_extend_answer":
        return "finds it hard to add one more detail";
      case "weak_reason_expression":
        return "simple because-style reasoning is still weak";
      case "low_retry_willingness":
        return "retry willingness is still low";
    }
  });
}

function describeRecentShift(snapshot: LearningSnapshot): string | null {
  if (snapshot.recentReasonRate >= 0.2) {
    return "recently starting to give simple reasons";
  }
  if (snapshot.recentDetailRate >= 0.3) {
    return "recently starting to add more detail";
  }
  if (snapshot.recentFullSentenceRate >= 0.5) {
    return "recently sounding more complete in answers";
  }
  return null;
}

function describeRecentConversationStyle(
  snapshot: LearningSnapshot,
  summaries: SessionSummary[]
): string | null {
  const familyTopicCount = summaries.filter((summary) => summary.topicId === "my-family").length;
  if (snapshot.currentStageGoal === "opening-confidence") {
    return "does better when the conversation starts casually and stays low pressure";
  }
  if (familyTopicCount >= 2) {
    return "seems more natural on familiar everyday topics";
  }
  if (snapshot.currentStageGoal === "more-independent-speaking") {
    return "can handle more open follow-up now";
  }
  return "still benefits from a natural chat entry before expansion";
}

function describeRecentComprehensionPattern(snapshot: LearningSnapshot): string | null {
  if (snapshot.recentChineseBridgeRate >= 0.4) {
    return "often needs Chinese bridge support before continuing in English";
  }
  if (snapshot.recentChineseBridgeRate >= 0.15) {
    return "sometimes benefits from a short Chinese support line";
  }
  return "usually can stay with simple English support";
}

function buildActiveSupports(params: {
  snapshot: LearningSnapshot;
  preferredEntryStyle: LearnerProfile["stableTraits"]["preferredEntryStyle"];
  pressureSensitivity: LearnerProfile["stableTraits"]["pressureSensitivity"];
  cnSupportNeed: LearnerProfile["stableTraits"]["cnSupportNeed"];
}): string[] {
  const supports: string[] = [];
  if (params.preferredEntryStyle === "free-chat-first") {
    supports.push("start with natural chat before pushing practice");
  }
  if (params.pressureSensitivity !== "low") {
    supports.push("keep pressure low and correction light");
  }
  if (params.cnSupportNeed !== "rare") {
    supports.push("allow short Chinese bridge support when needed");
  }
  if (params.snapshot.currentStageGoal === "full-sentence-building") {
    supports.push("push only toward one fuller sentence at a time");
  }
  if (params.snapshot.currentStageGoal === "add-one-more-detail") {
    supports.push("ask for only one more small detail");
  }
  if (params.snapshot.supportLevel === "high-support") {
    supports.push("prefer choice prompts or short scaffolds");
  }
  return Array.from(new Set(supports)).slice(0, 4);
}

function buildCurrentHypothesis(params: {
  openingWillingness: LearnerProfile["stableTraits"]["openingWillingness"];
  pressureSensitivity: LearnerProfile["stableTraits"]["pressureSensitivity"];
  preferredEntryStyle: LearnerProfile["stableTraits"]["preferredEntryStyle"];
  topBottleneck: LearningBottleneckTag | null;
  snapshot: LearningSnapshot;
}): string {
  const openingText =
    params.openingWillingness === "high"
      ? "This child is willing to interact"
      : params.openingWillingness === "medium"
        ? "This child can usually be brought into conversation"
        : "This child still needs help just to get started";
  const pressureText =
    params.pressureSensitivity === "high"
      ? "but becomes less steady when speaking feels pressured"
      : params.pressureSensitivity === "medium"
        ? "but still reacts to pressure in speaking tasks"
        : "and can usually stay steady once the conversation begins";
  const entryText =
    params.preferredEntryStyle === "free-chat-first"
      ? "A relaxed chat entry is the best lead-in."
      : params.preferredEntryStyle === "mixed"
        ? "A natural reply first, then light guidance, fits best."
        : "Direct practice prompts are becoming more workable.";
  const targetText = buildMainGrowthTarget(params.topBottleneck, params.snapshot.currentStageGoal);
  return `${openingText}, ${pressureText} ${entryText} Right now the main next step is to ${targetText}.`;
}
