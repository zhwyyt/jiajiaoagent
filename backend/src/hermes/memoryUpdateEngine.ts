import type {
  LearningBottleneckTag,
  LearningSnapshot,
  LearningStrengthTag,
  SessionSummary,
  TopicContext,
  TurnObservation,
  TurnRequest,
  TurnResponse,
  TurnStrategy
} from "../types/session.js";
import type { LearningMemoryRepository } from "../storage/learningMemoryRepository.js";
import { buildLearnerProfile } from "./learnerProfileEngine.js";

interface MemoryUpdateParams {
  repository: LearningMemoryRepository;
  childId: string;
  request: TurnRequest;
  response: TurnResponse;
  strategy: TurnStrategy;
  topicContext: TopicContext;
  sessionGoal?: string | null;
}

export async function updateLearningMemoryFromTurn(
  params: MemoryUpdateParams
): Promise<void> {
  const observation = buildTurnObservation(params);
  const existingSummary = await params.repository.getSessionSummary(params.request.sessionId);
  const nextSummary = buildNextSessionSummary({
    childId: params.childId,
    request: params.request,
    response: params.response,
    topicContext: params.topicContext,
    observation,
    existingSummary,
    sessionGoal: params.sessionGoal ?? params.strategy.sessionGoal ?? null
  });

  await params.repository.upsertSessionSummary(nextSummary);

  const recentSummaries = await params.repository.listRecentSessionSummaries(params.childId, 5);
  const nextSnapshot = buildLearningSnapshot(params.childId, recentSummaries);
  await params.repository.saveLearningSnapshot(nextSnapshot);
  const previousProfile = await params.repository.getLearnerProfile(params.childId);
  const learnerProfile = buildLearnerProfile({
    snapshot: nextSnapshot,
    recentSummaries,
    previousProfile
  });
  await params.repository.saveLearnerProfile(learnerProfile);
}

function buildTurnObservation(params: MemoryUpdateParams): TurnObservation {
  const childText = params.request.childUtteranceText.trim();
  const agentText = params.response.agentReplyText;
  const wordCount = countWords(childText);
  const normalizedLower = childText.toLowerCase();
  const usedChineseBridge = /[\u4e00-\u9fff]/u.test(childText);
  const wasChildSilentOrRefusing =
    wordCount === 0 ||
    /(i don't know|i dont know|don't know|dont know|不会|不知道|说不出来|不想说)/u.test(normalizedLower) ||
    /(不会|不知道|说不出来|不想说)/u.test(childText);
  const fullSentenceLikely = wordCount >= 3 && /[a-z]/i.test(childText);
  const addedDetailLikely =
    wordCount >= 8 || /\b(and|also|with|but)\b/i.test(childText) || /，|,/.test(childText);
  const reasoningLikely = /\b(because|so)\b/i.test(childText) || /(因为|所以)/u.test(childText);

  return {
    sessionId: params.request.sessionId,
    childId: params.childId,
    topicId: params.request.topicId,
    turnIndex: params.request.turnIndex,
    childUtteranceText: childText,
    agentReplyText: agentText,
    wasChildSilentOrRefusing,
    usedChineseBridge,
    comprehensionSupportMode: params.strategy.comprehensionSupportMode ?? "english-only",
    usedSentenceStarter: hasSentenceStarter(agentText),
    neededEitherOrPrompt: /\bor\b/i.test(agentText),
    neededRetryPrompt: /say it again|can you say|try again/i.test(agentText),
    correctionGiven: params.response.correction.enabled,
    correctionAccepted: false,
    answerLengthBucket: toAnswerLengthBucket(wordCount, wasChildSilentOrRefusing),
    fullSentenceLikely,
    addedDetailLikely,
    reasoningLikely
  };
}

function buildNextSessionSummary(params: {
  childId: string;
  request: TurnRequest;
  response: TurnResponse;
  topicContext: TopicContext;
  observation: TurnObservation;
  existingSummary: SessionSummary | null;
  sessionGoal: string | null;
}): SessionSummary {
  const base = params.existingSummary ?? {
    sessionId: params.request.sessionId,
    childId: params.childId,
    topicId: params.request.topicId,
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
    turnCount: 0,
    engagementLevel: "medium" as const,
    mainStageSignal: "opening-confidence" as const,
    bestSentence: "",
    mainBottleneck: null,
    mainStrength: null,
    usedChineseBridgeCount: 0,
    fullSentenceCount: 0,
    detailAnswerCount: 0,
    reasonAnswerCount: 0,
    retryAcceptedCount: 0,
    sessionGoal: null,
    sessionGoalAchieved: false,
    nextStepTarget: null
  };

  const turnCount = Math.max(base.turnCount, params.request.turnIndex + 1);
  const usedChineseBridgeCount =
    base.usedChineseBridgeCount + (params.observation.usedChineseBridge ? 1 : 0);
  const fullSentenceCount =
    base.fullSentenceCount + (params.observation.fullSentenceLikely ? 1 : 0);
  const detailAnswerCount =
    base.detailAnswerCount + (params.observation.addedDetailLikely ? 1 : 0);
  const reasonAnswerCount =
    base.reasonAnswerCount + (params.observation.reasoningLikely ? 1 : 0);
  const retryAcceptedCount = base.retryAcceptedCount;
  const bestSentence =
    params.observation.fullSentenceLikely &&
    params.observation.childUtteranceText.length > base.bestSentence.length
      ? params.observation.childUtteranceText
      : base.bestSentence;
  const mainBottleneck = pickMainBottleneck({
    observation: params.observation,
    fullSentenceCount,
    detailAnswerCount,
    reasonAnswerCount
  });
  const mainStrength = pickMainStrength({
    observation: params.observation,
    topicId: params.request.topicId
  });

  return {
    ...base,
    endedAt: new Date().toISOString(),
    turnCount,
    engagementLevel: pickEngagementLevel(turnCount, params.observation.wasChildSilentOrRefusing),
    mainStageSignal: inferMainStageSignal({
      mainBottleneck,
      fullSentenceCount,
      detailAnswerCount,
      reasonAnswerCount
    }),
    bestSentence,
    mainBottleneck,
    mainStrength,
    usedChineseBridgeCount,
    fullSentenceCount,
    detailAnswerCount,
    reasonAnswerCount,
    retryAcceptedCount,
    sessionGoal: params.sessionGoal,
    sessionGoalAchieved: inferSessionGoalAchieved(params.sessionGoal, params.observation),
    nextStepTarget: inferNextStepTarget(mainBottleneck, params.topicContext)
  };
}

function buildLearningSnapshot(
  childId: string,
  summaries: SessionSummary[]
): LearningSnapshot {
  const recentSessionsCount = summaries.length;
  const totals = summaries.reduce(
    (acc, summary) => {
      acc.turns += Math.max(summary.turnCount, 1);
      acc.fullSentence += summary.fullSentenceCount;
      acc.detail += summary.detailAnswerCount;
      acc.reason += summary.reasonAnswerCount;
      acc.cnBridge += summary.usedChineseBridgeCount;
      acc.retry += summary.retryAcceptedCount;
      if (summary.engagementLevel === "low") {
        acc.lowEngagementSessions += 1;
      }
      return acc;
    },
    {
      turns: 0,
      fullSentence: 0,
      detail: 0,
      reason: 0,
      cnBridge: 0,
      retry: 0,
      lowEngagementSessions: 0
    }
  );

  const topBottlenecks = pickTopTags(
    summaries.map((summary) => summary.mainBottleneck).filter(Boolean) as LearningBottleneckTag[]
  );
  const topStrengths = pickTopTags(
    summaries.map((summary) => summary.mainStrength).filter(Boolean) as LearningStrengthTag[]
  );
  const preferredTopics = pickTopTags(summaries.map((summary) => summary.topicId));
  const currentStageGoal = inferSnapshotStageGoal(topBottlenecks, summaries);

  return {
    childId,
    currentStageGoal,
    currentWeeklyFocus: deriveWeeklyFocus(currentStageGoal),
    lastStageReviewedAt: new Date().toISOString(),
    recentSessionsCount,
    recentFullSentenceRate: toRate(totals.fullSentence, totals.turns),
    recentDetailRate: toRate(totals.detail, totals.turns),
    recentReasonRate: toRate(totals.reason, totals.turns),
    recentChineseBridgeRate: toRate(totals.cnBridge, totals.turns),
    recentRetryAcceptanceRate: toRate(totals.retry, Math.max(recentSessionsCount, 1)),
    recentSilenceRate: toRate(totals.lowEngagementSessions, Math.max(recentSessionsCount, 1)),
    topBottlenecks,
    topStrengths,
    preferredTopics,
    supportLevel: inferSupportLevel(currentStageGoal)
  };
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function hasSentenceStarter(text: string): boolean {
  return /\b(I have|I like|My |I can|It is)\b/i.test(text);
}

function toAnswerLengthBucket(
  wordCount: number,
  wasSilentOrRefusing: boolean
): TurnObservation["answerLengthBucket"] {
  if (wasSilentOrRefusing || wordCount === 0) {
    return "silent";
  }
  if (wordCount <= 3) {
    return "short";
  }
  if (wordCount <= 8) {
    return "medium";
  }
  return "long";
}

function pickMainBottleneck(params: {
  observation: TurnObservation;
  fullSentenceCount: number;
  detailAnswerCount: number;
  reasonAnswerCount: number;
}): LearningBottleneckTag | null {
  if (params.observation.wasChildSilentOrRefusing) {
    return "afraid_to_speak";
  }
  if (params.observation.usedChineseBridge) {
    return "needs_cn_bridge";
  }
  if (!params.observation.fullSentenceLikely || params.fullSentenceCount === 0) {
    return "output_too_short";
  }
  if (!params.observation.addedDetailLikely && params.detailAnswerCount === 0) {
    return "cannot_extend_answer";
  }
  if (!params.observation.reasoningLikely && params.reasonAnswerCount === 0) {
    return "weak_reason_expression";
  }
  return null;
}

function pickMainStrength(params: {
  observation: TurnObservation;
  topicId: string;
}): LearningStrengthTag | null {
  if (params.observation.reasoningLikely) {
    return "can_give_simple_reason";
  }
  if (params.observation.addedDetailLikely) {
    return "can_add_detail";
  }
  if (params.observation.fullSentenceLikely) {
    return "can_answer_in_full_sentence";
  }
  if (!params.observation.wasChildSilentOrRefusing) {
    if (params.topicId === "my-family") {
      return "likes_topic_family";
    }
    if (params.topicId === "my-favorite-food") {
      return "likes_topic_food";
    }
    return "willing_to_speak";
  }
  return null;
}

function pickEngagementLevel(
  turnCount: number,
  wasSilentOrRefusing: boolean
): SessionSummary["engagementLevel"] {
  if (wasSilentOrRefusing && turnCount <= 2) {
    return "low";
  }
  if (turnCount >= 4 && !wasSilentOrRefusing) {
    return "high";
  }
  return "medium";
}

function inferMainStageSignal(params: {
  mainBottleneck: LearningBottleneckTag | null;
  fullSentenceCount: number;
  detailAnswerCount: number;
  reasonAnswerCount: number;
}): SessionSummary["mainStageSignal"] {
  if (params.mainBottleneck === "afraid_to_speak") {
    return "opening-confidence";
  }
  if (params.fullSentenceCount === 0) {
    return "full-sentence-building";
  }
  if (params.detailAnswerCount === 0) {
    return "add-one-more-detail";
  }
  if (params.reasonAnswerCount === 0) {
    return "simple-reasoning";
  }
  return "more-independent-speaking";
}

function inferNextStepTarget(
  bottleneck: LearningBottleneckTag | null,
  topicContext: TopicContext
): string | null {
  switch (bottleneck) {
    case "afraid_to_speak":
      return `Stay with an easy ${topicContext.title.toLowerCase()} question and keep speaking.`;
    case "output_too_short":
      return "Try to answer in one full sentence next time.";
    case "needs_cn_bridge":
      return "Try to turn one mixed Chinese-English idea into one full English sentence.";
    case "cannot_extend_answer":
      return "Say one more detail after your first answer.";
    case "weak_reason_expression":
      return "Try one short because sentence next time.";
    default:
      return null;
  }
}

function inferSessionGoalAchieved(
  sessionGoal: string | null,
  observation: TurnObservation
): boolean {
  if (!sessionGoal) {
    return false;
  }
  if (/because/i.test(sessionGoal)) {
    return observation.reasoningLikely;
  }
  if (/detail/i.test(sessionGoal)) {
    return observation.addedDetailLikely;
  }
  if (/full sentence/i.test(sessionGoal)) {
    return observation.fullSentenceLikely;
  }
  if (/easy questions/i.test(sessionGoal)) {
    return !observation.wasChildSilentOrRefusing;
  }
  return false;
}

function pickTopTags<T extends string>(values: T[]): T[] {
  const counts = new Map<T, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([value]) => value);
}

function inferSnapshotStageGoal(
  topBottlenecks: LearningBottleneckTag[],
  summaries: SessionSummary[]
): LearningSnapshot["currentStageGoal"] {
  if (topBottlenecks.includes("afraid_to_speak")) {
    return "opening-confidence";
  }
  if (topBottlenecks.includes("output_too_short")) {
    return "full-sentence-building";
  }
  if (topBottlenecks.includes("cannot_extend_answer")) {
    return "add-one-more-detail";
  }
  if (topBottlenecks.includes("weak_reason_expression")) {
    return "simple-reasoning";
  }
  if (summaries.some((summary) => summary.mainStageSignal === "more-independent-speaking")) {
    return "more-independent-speaking";
  }
  return "full-sentence-building";
}

function deriveWeeklyFocus(stageGoal: LearningSnapshot["currentStageGoal"]): string[] {
  switch (stageGoal) {
    case "opening-confidence":
      return ["keep speaking", "answer easy questions"];
    case "full-sentence-building":
      return ["answer in full sentences"];
    case "add-one-more-detail":
      return ["add one more detail"];
    case "simple-reasoning":
      return ["say one short because sentence"];
    case "more-independent-speaking":
      return ["say more with less help"];
  }
}

function inferSupportLevel(
  stageGoal: LearningSnapshot["currentStageGoal"]
): LearningSnapshot["supportLevel"] {
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

function toRate(value: number, total: number): number {
  if (!total) {
    return 0;
  }
  return Number((value / total).toFixed(3));
}
