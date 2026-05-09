import type { EvaluatedTurnResponse } from "../types/session.js";

export function evaluateResponse(replyText: string): EvaluatedTurnResponse {
  return {
    agentReplyText: replyText,
    correctionEnabled: false,
    correctionFocus: null,
    promptHint: null
  };
}
