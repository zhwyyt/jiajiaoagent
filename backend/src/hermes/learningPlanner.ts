import type {
  CorrectionMode,
  LearnerProfile,
  LearningPlan,
  LearningSnapshot,
  ProgressEvaluatorResult,
  SessionSummary,
  StageGoal,
  SupportLevel,
  TopicContext
} from "../types/session.js";

export function buildLearningPlan(params: {
  snapshot: LearningSnapshot | null;
  learnerProfile?: LearnerProfile | null;
  evaluatorResult: ProgressEvaluatorResult;
  recentSummaries: SessionSummary[];
  topicContext: TopicContext;
}): LearningPlan {
  const stageGoal = resolveStageGoal(params.snapshot, params.evaluatorResult);
  const supportLevel = inferSupportLevel(stageGoal, params.learnerProfile);
  const correctionMode = inferCorrectionMode(stageGoal);
  const weeklyFocus = deriveWeeklyFocus(stageGoal, params.learnerProfile);
  const sessionGoal = deriveSessionGoal(stageGoal, params.topicContext, params.learnerProfile);

  return {
    stageGoal,
    weeklyFocus,
    supportLevel,
    correctionMode,
    topicRotationRecommendation: inferTopicRotation(stageGoal),
    sessionGoal,
    parentFacingNoteSeed: {
      currentFocus: weeklyFocus[0] ?? "keep speaking",
      recentImprovement: inferRecentImprovement(params.evaluatorResult.progressSignals),
      currentBottleneck: params.snapshot?.topBottlenecks[0] ?? null,
      suggestedParentSupport: inferParentSupport(stageGoal)
    }
  };
}

function resolveStageGoal(
  snapshot: LearningSnapshot | null,
  evaluatorResult: ProgressEvaluatorResult
): StageGoal {
  const current = snapshot?.currentStageGoal ?? evaluatorResult.currentStageGoal;

  if (evaluatorResult.recommendedStageAction === "fallback") {
    return "opening-confidence";
  }

  if (evaluatorResult.recommendedStageAction === "advance") {
    return nextStageGoal(current);
  }

  return current;
}

function nextStageGoal(current: StageGoal): StageGoal {
  switch (current) {
    case "opening-confidence":
      return "full-sentence-building";
    case "full-sentence-building":
      return "add-one-more-detail";
    case "add-one-more-detail":
      return "simple-reasoning";
    case "simple-reasoning":
      return "more-independent-speaking";
    case "more-independent-speaking":
      return "more-independent-speaking";
  }
}

function inferSupportLevel(
  stageGoal: StageGoal,
  learnerProfile?: LearnerProfile | null
): SupportLevel {
  if (learnerProfile?.stableTraits.pressureSensitivity === "high") {
    return "high-support";
  }
  switch (stageGoal) {
    case "opening-confidence":
      return "high-support";
    case "full-sentence-building":
    case "add-one-more-detail":
      return "medium-support";
    case "simple-reasoning":
    case "more-independent-speaking":
      return "light-support";
  }
}

function inferCorrectionMode(stageGoal: StageGoal): CorrectionMode {
  switch (stageGoal) {
    case "opening-confidence":
      return "minimal";
    case "full-sentence-building":
    case "add-one-more-detail":
      return "gentle";
    case "simple-reasoning":
    case "more-independent-speaking":
      return "focused";
  }
}

function deriveWeeklyFocus(
  stageGoal: StageGoal,
  learnerProfile?: LearnerProfile | null
): string[] {
  switch (stageGoal) {
    case "opening-confidence":
      return learnerProfile?.stableTraits.preferredEntryStyle === "free-chat-first"
        ? ["keep pressure low", "start with natural chat", "help the child keep speaking"]
        : ["keep pressure low", "help the child keep speaking"];
    case "full-sentence-building":
      return learnerProfile?.stableTraits.pressureSensitivity === "high"
        ? ["gently encourage fuller sentences", "do not make it feel like a task"]
        : ["gently encourage full sentences"];
    case "add-one-more-detail":
      return ["gently invite one more detail"];
    case "simple-reasoning":
      return ["gently invite one short because sentence"];
    case "more-independent-speaking":
      return ["let the child say a little more with less help"];
  }
}

function deriveSessionGoal(
  stageGoal: StageGoal,
  topicContext: TopicContext,
  learnerProfile?: LearnerProfile | null
): string | null {
  switch (stageGoal) {
    case "opening-confidence":
      return learnerProfile?.stableTraits.preferredEntryStyle === "free-chat-first"
        ? `Start with relaxed chat, then help the child answer a few easy questions about ${topicContext.title.toLowerCase()}.`
        : `Keep pressure low and help the child answer a few easy questions about ${topicContext.title.toLowerCase()}.`;
    case "full-sentence-building":
      return learnerProfile?.stableTraits.pressureSensitivity === "high"
        ? `After replying naturally, gently guide the child toward slightly fuller sentences about ${topicContext.title.toLowerCase()}.`
        : `Gently guide the child toward fuller sentences about ${topicContext.title.toLowerCase()}.`;
    case "add-one-more-detail":
      return "After a good answer, gently invite one more small detail.";
    case "simple-reasoning":
      return "When it fits, gently invite one short because sentence.";
    case "more-independent-speaking":
      return "Let the child carry a little more of the conversation with less help.";
  }
}

function inferTopicRotation(
  stageGoal: StageGoal
): LearningPlan["topicRotationRecommendation"] {
  switch (stageGoal) {
    case "opening-confidence":
      return "repeat-safe-topic";
    case "full-sentence-building":
    case "add-one-more-detail":
      return "mix-safe-and-growth-topic";
    case "simple-reasoning":
    case "more-independent-speaking":
      return "introduce-next-topic";
  }
}

function inferRecentImprovement(signals: string[]): string | null {
  if (signals.includes("reason_answers_emerging")) {
    return "The child is starting to give simple reasons.";
  }
  if (signals.includes("detail_answers_emerging")) {
    return "The child is starting to add more details.";
  }
  if (signals.includes("full_sentence_stable")) {
    return "The child is answering in fuller sentences more often.";
  }
  return null;
}

function inferParentSupport(stageGoal: StageGoal): string | null {
  switch (stageGoal) {
    case "opening-confidence":
      return "Let the child answer slowly and do not rush to correct.";
    case "full-sentence-building":
      return "Encourage the child to say the whole sentence, not just one word.";
    case "add-one-more-detail":
      return "Ask for one more small detail after each answer.";
    case "simple-reasoning":
      return "Encourage one short because sentence.";
    case "more-independent-speaking":
      return "Wait a little before helping so the child can try alone first.";
  }
}
