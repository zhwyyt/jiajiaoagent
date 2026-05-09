import type { AppContainer } from "../bootstrap/container.js";
import { loadChildContext } from "../hermes/profileContextLoader.js";
import { buildPromptPayload } from "../hermes/promptBuilder.js";
import {
  buildQuickIntentTurnResponse,
  getQuickIntentResponse
} from "../hermes/quickIntentResponder.js";
import { evaluateResponse } from "../hermes/responseEvaluator.js";
import { routeStartSession, routeTurn } from "../hermes/sessionRouter.js";
import { buildSessionWrapup } from "../hermes/sessionWrapupEngine.js";
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
  const strategy = decideTurnStrategy(request, topicContext);
  const promptPayload = buildPromptPayload(request, strategy, childContext, topicContext);
  const evaluated = evaluateResponse(promptPayload.fallbackReplyText);
  const wrapup =
    route.route === "wrap-up"
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

  return {
    sessionId: request.sessionId,
    agentReplyText,
    shouldPlayTts: true,
    correction: {
      enabled: wrapup ? false : evaluated.correctionEnabled,
      focus: wrapup ? null : evaluated.correctionFocus,
      mode: !wrapup && evaluated.correctionEnabled ? "gentle" : "none"
    },
    promptHint: wrapup ? wrapup.nextPracticeHints[0] ?? null : evaluated.promptHint ?? strategy.promptHint,
    isSessionComplete: wrapup?.topicCompleted ?? strategy.shouldWrapUp
  };
}

function buildWrapupReplyText(wrapup: ReturnType<typeof buildSessionWrapup>): string {
  const hint = wrapup.nextPracticeHints[0];

  if (!hint) {
    return `${wrapup.summary} See you next time.`;
  }

  return `${wrapup.summary} Great speaking today. ${hint}`;
}
