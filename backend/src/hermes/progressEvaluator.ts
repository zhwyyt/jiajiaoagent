import type {
  LearningSnapshot,
  ProgressEvaluatorResult,
  SessionSummary,
  StageGoal
} from "../types/session.js";

export function evaluateProgress(params: {
  snapshot: LearningSnapshot | null;
  recentSummaries: SessionSummary[];
}): ProgressEvaluatorResult {
  const snapshot = params.snapshot;
  const recentSummaries = params.recentSummaries;

  if (!snapshot || recentSummaries.length === 0) {
    return {
      currentStageGoal: "full-sentence-building",
      recommendedStageAction: "watch",
      progressSignals: ["not_enough_history"]
    };
  }

  const currentStageGoal = snapshot.currentStageGoal;
  const progressSignals: string[] = [];

  if (snapshot.recentSilenceRate >= 0.4) {
    progressSignals.push("high_silence_rate");
  }
  if (snapshot.recentFullSentenceRate >= 0.5) {
    progressSignals.push("full_sentence_stable");
  }
  if (snapshot.recentDetailRate >= 0.3) {
    progressSignals.push("detail_answers_emerging");
  }
  if (snapshot.recentReasonRate >= 0.2) {
    progressSignals.push("reason_answers_emerging");
  }
  if (snapshot.recentChineseBridgeRate >= 0.4) {
    progressSignals.push("high_cn_bridge_rate");
  }

  const recommendedStageAction = decideStageAction({
    currentStageGoal,
    snapshot,
    progressSignals
  });

  return {
    currentStageGoal,
    recommendedStageAction,
    progressSignals
  };
}

function decideStageAction(params: {
  currentStageGoal: StageGoal;
  snapshot: LearningSnapshot;
  progressSignals: string[];
}): ProgressEvaluatorResult["recommendedStageAction"] {
  if (params.progressSignals.includes("high_silence_rate")) {
    return params.currentStageGoal === "opening-confidence" ? "keep" : "fallback";
  }

  if (
    params.currentStageGoal === "full-sentence-building" &&
    params.progressSignals.includes("full_sentence_stable")
  ) {
    return "advance";
  }

  if (
    params.currentStageGoal === "add-one-more-detail" &&
    params.progressSignals.includes("detail_answers_emerging")
  ) {
    return "advance";
  }

  if (
    params.currentStageGoal === "simple-reasoning" &&
    params.progressSignals.includes("reason_answers_emerging")
  ) {
    return "advance";
  }

  if (params.snapshot.recentSessionsCount < 3) {
    return "watch";
  }

  return "keep";
}
