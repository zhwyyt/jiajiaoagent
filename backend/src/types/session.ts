export interface StartSessionRequest {
  childId: string;
  topicId: string;
  currentLevel: number;
}

export interface StartSessionResponse {
  sessionId: string;
  topicId: string;
  openingMessage: string;
  suggestedReplyMode: "simple-question" | "guided";
}

export type TurnRoute = "start" | "turn" | "wrap-up";

export interface TurnRouteResult {
  route: TurnRoute;
  topicId: string;
}

export interface TurnMessage {
  speaker: "agent" | "child";
  text: string;
}

export interface TurnRequest {
  sessionId: string;
  topicId: string;
  turnIndex: number;
  childUtteranceText: string;
  recentTurns: TurnMessage[];
}

export interface TurnStrategy {
  correctionEnabled: boolean;
  correctionFocus: string | null;
  promptHint: string | null;
  shouldWrapUp: boolean;
  replyMode: "expand-answer" | "follow-up" | "open-chat";
  speakingMove: "naming" | "description" | "choice" | "detail" | "feeling" | "reason";
  comprehensionSupportMode?: ComprehensionSupportMode;
  stageGoal?: StageGoal;
  weeklyFocus?: string[];
  sessionGoal?: string | null;
  supportLevel?: SupportLevel;
  correctionMode?: CorrectionMode;
}

export interface ChildContext {
  childId: string;
  currentSpeakingLevel: number;
  focusAreas: string[];
  encouragementStyle: "gentle" | "lively" | "game-like";
}

export interface TopicContext {
  topicId: string;
  title: string;
  openingMessage: string;
  communicationGoal: string;
  speakingMoves: Array<"naming" | "description" | "choice" | "detail" | "feeling" | "reason">;
  keyVocabulary: string[];
  keyPatterns: string[];
  sentenceStarters: string[];
  starterQuestions: string[];
  followUpQuestions: string[];
  eitherOrPrompts: string[];
  wrapupTargets: string[];
  completionSignals: string[];
}

export interface EvaluatedTurnResponse {
  agentReplyText: string;
  correctionEnabled: boolean;
  correctionFocus: string | null;
  promptHint: string | null;
}

export interface SessionWrapup {
  sessionId: string;
  summary: string;
  nextPracticeHints: string[];
  topicCompleted: boolean;
}

export interface ActiveSessionState {
  sessionId: string;
  childId: string;
  topicId: string;
  currentTurnIndex: number;
  currentState: "started" | "awaiting_child_input" | "wrapping_up" | "completed";
}

export interface TurnResponse {
  sessionId: string;
  agentReplyText: string;
  shouldPlayTts: boolean;
  source?: "llm" | "fallback" | "quick-intent" | "wrap-up" | "report";
  correction: {
    enabled: boolean;
    focus: string | null;
    mode: "none" | "gentle";
  };
  promptHint: string | null;
  isSessionComplete: boolean;
}

export type LearningBottleneckTag =
  | "afraid_to_speak"
  | "output_too_short"
  | "needs_sentence_starter"
  | "needs_cn_bridge"
  | "cannot_extend_answer"
  | "weak_reason_expression"
  | "low_retry_willingness";

export type LearningStrengthTag =
  | "willing_to_speak"
  | "accepts_retry"
  | "can_answer_in_full_sentence"
  | "can_add_detail"
  | "can_give_simple_reason"
  | "responds_well_to_choice_prompt"
  | "likes_topic_family"
  | "likes_topic_food";

export interface TurnObservation {
  sessionId: string;
  childId: string;
  topicId: string;
  turnIndex: number;
  childUtteranceText: string;
  agentReplyText: string;
  wasChildSilentOrRefusing: boolean;
  usedChineseBridge: boolean;
  comprehensionSupportMode: ComprehensionSupportMode;
  usedSentenceStarter: boolean;
  neededEitherOrPrompt: boolean;
  neededRetryPrompt: boolean;
  correctionGiven: boolean;
  correctionAccepted: boolean;
  answerLengthBucket: "silent" | "short" | "medium" | "long";
  fullSentenceLikely: boolean;
  addedDetailLikely: boolean;
  reasoningLikely: boolean;
}

export interface SessionSummary {
  sessionId: string;
  childId: string;
  topicId: string;
  startedAt: string;
  endedAt: string;
  turnCount: number;
  engagementLevel: "low" | "medium" | "high";
  mainStageSignal:
    | "opening-confidence"
    | "full-sentence-building"
    | "add-one-more-detail"
    | "simple-reasoning"
    | "more-independent-speaking";
  bestSentence: string;
  mainBottleneck: LearningBottleneckTag | null;
  mainStrength: LearningStrengthTag | null;
  usedChineseBridgeCount: number;
  fullSentenceCount: number;
  detailAnswerCount: number;
  reasonAnswerCount: number;
  retryAcceptedCount: number;
  sessionGoal: string | null;
  sessionGoalAchieved: boolean;
  nextStepTarget: string | null;
}

export interface LearningSnapshot {
  childId: string;
  currentStageGoal: StageGoal;
  currentWeeklyFocus: string[];
  lastStageReviewedAt: string;
  recentSessionsCount: number;
  recentFullSentenceRate: number;
  recentDetailRate: number;
  recentReasonRate: number;
  recentChineseBridgeRate: number;
  recentRetryAcceptanceRate: number;
  recentSilenceRate: number;
  topBottlenecks: LearningBottleneckTag[];
  topStrengths: LearningStrengthTag[];
  preferredTopics: string[];
  supportLevel: SupportLevel;
}

export interface LearnerProfile {
  childId: string;
  profileVersion: "v1";
  lastUpdatedAt: string;
  stableTraits: {
    openingWillingness: LearnerLevel;
    pressureSensitivity: LearnerLevel;
    preferredEntryStyle: PreferredEntryStyle;
    cnSupportNeed: SupportNeedLevel;
    preferredScaffold: PreferredScaffold;
  };
  currentStage: {
    stageGoal: StageGoal;
    stageConfidence: LearnerLevel;
    mainGrowthTarget: string;
  };
  recentSignals: {
    recentStrengths: string[];
    recentBottlenecks: string[];
    recentShiftSummary: string | null;
    recentConversationStyle: string | null;
    recentComprehensionPattern: string | null;
  };
  activeSupports: string[];
  currentHypothesis: string;
}

export type StageGoal =
  | "opening-confidence"
  | "full-sentence-building"
  | "add-one-more-detail"
  | "simple-reasoning"
  | "more-independent-speaking";

export type SupportLevel = "high-support" | "medium-support" | "light-support";

export type LearnerLevel = "low" | "medium" | "high";

export type PreferredEntryStyle =
  | "free-chat-first"
  | "mixed"
  | "direct-practice-ok";

export type SupportNeedLevel = "rare" | "occasional" | "frequent";

export type PreferredScaffold =
  | "choice"
  | "sentence-starter"
  | "open-prompt"
  | "mixed";

export type CorrectionMode = "minimal" | "gentle" | "focused";

export interface ProgressEvaluatorResult {
  currentStageGoal: StageGoal;
  recommendedStageAction: "keep" | "advance" | "fallback" | "watch";
  progressSignals: string[];
}

export interface LearningPlan {
  stageGoal: StageGoal;
  weeklyFocus: string[];
  supportLevel: SupportLevel;
  correctionMode: CorrectionMode;
  topicRotationRecommendation:
    | "repeat-safe-topic"
    | "mix-safe-and-growth-topic"
    | "introduce-next-topic";
  sessionGoal: string | null;
  parentFacingNoteSeed: {
    currentFocus: string;
    recentImprovement: string | null;
    currentBottleneck: LearningBottleneckTag | null;
    suggestedParentSupport: string | null;
  };
}

export interface ParentReport {
  childId: string;
  generatedAt: string;
  basedOnSessionIds: string[];
  currentFocus: string;
  recentStrengths: string[];
  currentBottleneck: string | null;
  childSnapshot: string;
  nextSmallGoal: string;
  parentSupportSuggestions: string[];
}

export type ComprehensionSupportMode =
  | "english-only"
  | "english-with-chinese-support"
  | "chinese-bridge-to-english";
