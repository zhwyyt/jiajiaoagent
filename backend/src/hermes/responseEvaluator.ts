import type { EvaluatedTurnResponse } from "../types/session.js";

export function evaluateResponse(replyText: string): EvaluatedTurnResponse {
  const normalizedReply = normalizeReplyText(replyText);

  return {
    agentReplyText: normalizedReply,
    correctionEnabled: false,
    correctionFocus: null,
    promptHint: null
  };
}

function normalizeReplyText(replyText: string): string {
  const trimmed = replyText.trim().replace(/\s+/g, " ");

  if (!trimmed) {
    return "Good job! Tell me one more sentence.";
  }

  if (/[.!?]$/.test(trimmed)) {
    return trimmed;
  }

  return `${trimmed}.`;
}
