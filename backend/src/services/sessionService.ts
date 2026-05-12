import type { AppContainer } from "../bootstrap/container.js";
import { loadChildContext } from "../hermes/profileContextLoader.js";
import { generateTutorReplyWithLlm } from "../hermes/llmTutorResponder.js";
import { buildLearningPlan } from "../hermes/learningPlanner.js";
import { updateLearningMemoryFromTurn } from "../hermes/memoryUpdateEngine.js";
import {
  buildParentReport,
  formatParentReportText
} from "../hermes/parentReportGenerator.js";
import { buildPromptPayload } from "../hermes/promptBuilder.js";
import { evaluateProgress } from "../hermes/progressEvaluator.js";
import {
  buildQuickIntentTurnResponse,
  getQuickIntentResponse
} from "../hermes/quickIntentResponder.js";
import { evaluateResponse } from "../hermes/responseEvaluator.js";
import { routeStartSession, routeTurn } from "../hermes/sessionRouter.js";
import {
  buildSessionWrapup,
  shouldOfferSessionWrapup
} from "../hermes/sessionWrapupEngine.js";
import { decideTurnStrategy } from "../hermes/turnStrategyEngine.js";
import type {
  StartSessionRequest,
  StartSessionResponse,
  TurnRequest,
  TurnResponse
} from "../types/session.js";

export function buildStartSessionResponse(
  request: StartSessionRequest,
  container: AppContainer
): Promise<StartSessionResponse> {
  return buildStartSession(request, container);
}

async function buildStartSession(
  request: StartSessionRequest,
  container: AppContainer
): Promise<StartSessionResponse> {
  const route = routeStartSession(request);
  const sessionId = crypto.randomUUID();
  const topicContext = await container.topicRepository.getTopicContext(route.topicId);

  await container.sessionRepository.createSession({
    sessionId,
    childId: request.childId,
    topicId: route.topicId
  });

  await container.sessionStateManager.save({
    sessionId,
    childId: request.childId,
    topicId: route.topicId,
    currentTurnIndex: 0,
    currentState: "awaiting_child_input"
  });

  return {
    sessionId,
    topicId: route.topicId,
    openingMessage: topicContext.openingMessage,
    suggestedReplyMode: "simple-question"
  };
}

export async function buildParentReportResponse(
  params: {
    childId: string;
    topicId: string;
    sessionId: string;
  },
  container: AppContainer
): Promise<TurnResponse> {
  const recentSummaries = await container.learningMemoryRepository.listRecentSessionSummaries(
    params.childId,
    3
  );
  const learningSnapshot = await container.learningMemoryRepository.getLearningSnapshot(params.childId);
  const learnerProfile = await container.learningMemoryRepository.getLearnerProfile(params.childId);

  if (!recentSummaries.length || !learningSnapshot || !learnerProfile) {
    return {
      sessionId: params.sessionId,
      agentReplyText:
        "现在还没有足够的历史对话，暂时还生成不了学习报告。先多聊几轮，我再给你一份更有参考价值的家长报告。",
      shouldPlayTts: false,
      source: "report",
      correction: {
        enabled: false,
        focus: null,
        mode: "none"
      },
      promptHint: null,
      isSessionComplete: false
    };
  }

  const topicContext = await container.topicRepository.getTopicContext(params.topicId);
  const evaluatorResult = evaluateProgress({
    snapshot: learningSnapshot,
    recentSummaries
  });
  const learningPlan = buildLearningPlan({
    snapshot: learningSnapshot,
    learnerProfile,
    evaluatorResult,
    recentSummaries,
    topicContext
  });
  const report = buildParentReport({
    childId: params.childId,
    learnerProfile,
    learningPlan,
    learningSnapshot,
    recentSummaries
  });

  return {
    sessionId: params.sessionId,
    agentReplyText: formatParentReportText(report),
    shouldPlayTts: false,
    source: "report",
    correction: {
      enabled: false,
      focus: null,
      mode: "none"
    },
    promptHint: null,
    isSessionComplete: false
  };
}

export async function buildTurnResponse(
  request: TurnRequest,
  container: AppContainer
): Promise<TurnResponse> {
  const route = routeTurn(request);
  const sessionState = await container.sessionStateManager.load(request.sessionId);
  const quickIntent = getQuickIntentResponse(request);

  if (quickIntent) {
    if (sessionState) {
      await container.sessionStateManager.save({
        ...sessionState,
        currentTurnIndex: request.turnIndex,
        currentState: "awaiting_child_input"
      });
    }

    return buildQuickIntentTurnResponse(request, quickIntent);
  }

  const childContext = sessionState
    ? await container.profileRepository.getChildContext(sessionState.childId)
    : loadChildContext("trial-child-001");
  const topicContext = await container.topicRepository.getTopicContext(request.topicId);
  const recentSummaries =
    sessionState
      ? await container.learningMemoryRepository.listRecentSessionSummaries(sessionState.childId, 5)
      : [];
  const learningSnapshot = sessionState
    ? await container.learningMemoryRepository.getLearningSnapshot(sessionState.childId)
    : null;
  const learnerProfile = sessionState
    ? await container.learningMemoryRepository.getLearnerProfile(sessionState.childId)
    : null;
  const evaluatorResult = evaluateProgress({
    snapshot: learningSnapshot,
    recentSummaries
  });
  const learningPlan = buildLearningPlan({
    snapshot: learningSnapshot,
    learnerProfile,
    evaluatorResult,
    recentSummaries,
    topicContext
  });
  const strategy = decideTurnStrategy(request, topicContext, learningPlan, learnerProfile);
  const promptPayload = buildPromptPayload(request, strategy, childContext, topicContext);
  const llmReply = await generateTutorReplyWithLlm({
    request,
    strategy,
    childContext,
    topicContext,
    learnerProfile
  }).catch(() => null);
  const evaluated = evaluateResponse(llmReply?.replyText ?? promptPayload.fallbackReplyText);
  const allowWrapup = shouldOfferSessionWrapup({ request, strategy });
  const wrapup =
    route.route === "wrap-up" && allowWrapup
      ? buildSessionWrapup(request.sessionId, request, topicContext)
      : null;
  const agentReplyText = wrapup
    ? buildWrapupReplyText(wrapup)
    : evaluated.agentReplyText;

  if (sessionState) {
    await container.sessionStateManager.save({
      ...sessionState,
      currentTurnIndex: request.turnIndex,
      currentState: wrapup ? "completed" : "awaiting_child_input"
    });
  }

  if (wrapup) {
    await container.sessionRepository.completeSession(wrapup);
  }

  const turnResponse: TurnResponse = {
    sessionId: request.sessionId,
    agentReplyText,
    shouldPlayTts: true,
    source: wrapup ? "wrap-up" : llmReply ? "llm" : "fallback",
    correction: {
      enabled: wrapup ? false : evaluated.correctionEnabled,
      focus: wrapup ? null : evaluated.correctionFocus,
      mode: !wrapup && evaluated.correctionEnabled ? "gentle" : "none"
    },
    promptHint: wrapup
      ? wrapup.nextPracticeHints[0] ?? null
      : llmReply?.promptHint ?? evaluated.promptHint ?? strategy.promptHint,
    isSessionComplete: wrapup?.topicCompleted ?? false
  };

  if (sessionState) {
    await updateLearningMemoryFromTurn({
      repository: container.learningMemoryRepository,
      childId: sessionState.childId,
      request,
      response: turnResponse,
      strategy,
      topicContext,
      sessionGoal: learningPlan.sessionGoal
    });
  }

  return turnResponse;
}

function buildWrapupReplyText(wrapup: ReturnType<typeof buildSessionWrapup>): string {
  const hint = wrapup.nextPracticeHints[0];

  if (!hint) {
    return `${wrapup.summary} See you next time.`;
  }

  return `${wrapup.summary} Great speaking today. ${hint}`;
}
