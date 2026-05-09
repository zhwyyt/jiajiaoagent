import type { TopicContext, TurnRequest, SessionWrapup } from "../types/session.js";

export function buildSessionWrapup(
  sessionId: string,
  request: TurnRequest,
  topicContext: TopicContext
): SessionWrapup {
  const latestChildText = request.childUtteranceText.trim();
  const recentChildTurns = request.recentTurns
    .filter((turn) => turn.speaker === "child")
    .map((turn) => turn.text.trim())
    .filter(Boolean);
  const mentionFullSentence = /\b(i|my|this|he|she|we|they)\b/i.test(latestChildText);
  const mentionFamilyWord =
    /\b(mother|mom|mum|father|dad|sister|brother|grandma|grandfather|grandmother|family)\b/i.test(
      latestChildText
    );
  const summaryParts: string[] = [];

  if (mentionFullSentence) {
    summaryParts.push("You used a full sentence");
  } else {
    summaryParts.push("You shared your idea");
  }

  if (mentionFamilyWord) {
    summaryParts.push(`about ${topicContext.title}`);
  }

  const nextPracticeHints = buildNextPracticeHints(topicContext, latestChildText, recentChildTurns);

  return {
    sessionId,
    summary: `${summaryParts.join(" ")} today.`,
    nextPracticeHints,
    topicCompleted: true
  };
}

function buildNextPracticeHints(
  topicContext: TopicContext,
  latestChildText: string,
  recentChildTurns: string[]
): string[] {
  const hints: string[] = [...topicContext.wrapupTargets];
  const wordCount = latestChildText.split(/\s+/).filter(Boolean).length;

  if (wordCount <= 3) {
    hints.unshift('Next time, try one full sentence like "My brother likes football."');
  } else {
    hints.unshift("Next time, try two connected sentences.");
  }

  if (!/\b(play|read|cook|watch|go|eat|sing|dance|walk|talk|study|help)\b/i.test(latestChildText)) {
    hints.push("You can add one action or activity next time.");
  }

  if (recentChildTurns.length <= 2) {
    hints.push("Try to keep the conversation going for one more turn next time.");
  }

  return Array.from(new Set(hints)).slice(0, 2);
}
