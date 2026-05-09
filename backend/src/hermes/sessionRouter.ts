import type {
  StartSessionRequest,
  TurnRequest,
  TurnRoute,
  TurnRouteResult
} from "../types/session.js";

export function routeStartSession(
  request: StartSessionRequest
): TurnRouteResult {
  return {
    route: "start",
    topicId: request.topicId
  };
}

export function routeTurn(request: TurnRequest): TurnRouteResult {
  const route: TurnRoute =
    request.turnIndex <= 0 ? "start" : request.turnIndex >= 6 ? "wrap-up" : "turn";

  return {
    route,
    topicId: request.topicId
  };
}
