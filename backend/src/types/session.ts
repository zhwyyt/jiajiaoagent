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
  replyMode: "expand-answer" | "follow-up";
  speakingMove: "naming" | "description" | "choice" | "detail" | "feeling" | "reason";
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
  correction: {
    enabled: boolean;
    focus: string | null;
    mode: "none" | "gentle";
  };
  promptHint: string | null;
  isSessionComplete: boolean;
}
