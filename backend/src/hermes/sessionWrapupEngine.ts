import type { SessionWrapup } from "../types/session.js";

export function buildSessionWrapup(sessionId: string): SessionWrapup {
  return {
    sessionId,
    summary: "Nice speaking practice. Keep using full sentences.",
    nextPracticeHints: ["Say one more sentence next time."],
    topicCompleted: true
  };
}
