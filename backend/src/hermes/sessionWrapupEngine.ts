import type {
  SessionWrapup,
  TopicContext,
  TurnRequest,
  TurnStrategy
} from "../types/session.js";

export function shouldOfferSessionWrapup(params: {
  request: TurnRequest;
  strategy: TurnStrategy;
}): boolean {
  const { request, strategy } = params;
  const latestChildText = request.childUtteranceText.trim();
  const childTurns = [
    ...request.recentTurns
      .filter((turn) => turn.speaker === "child")
      .map((turn) => turn.text.trim())
      .filter(Boolean),
    latestChildText
  ].filter(Boolean);
  const meaningfulTurns = childTurns.filter(
    (text) => text.split(/\s+/).filter(Boolean).length >= 3 || /[\u4e00-\u9fff]/.test(text)
  );
  const latestWordCount = latestChildText.split(/\s+/).filter(Boolean).length;
  const latestLooksEmotional =
    /(焦虑|紧张|害怕|不敢|开不了口|说不出来|烦|难受|压力)/u.test(latestChildText) ||
    /\b(nervous|anxious|scared|afraid|shy|worried|stuck|embarrassed)\b/i.test(latestChildText);
  const latestIsQuestion =
    /[?？]$/.test(latestChildText) ||
    /^(what|who|where|when|why|how|do|does|did|can|are|is|am|will|would|could|should)\b/i.test(
      latestChildText
    );
  const latestIsResetLike = /重新开始聊天|restart|start again/i.test(latestChildText);

  if (!strategy.shouldWrapUp) {
    return false;
  }

  if (strategy.replyMode === "open-chat") {
    return false;
  }

  if (request.turnIndex < 6) {
    return false;
  }

  if (latestLooksEmotional || latestIsQuestion || latestIsResetLike) {
    return false;
  }

  if (childTurns.length < 3 || meaningfulTurns.length < 2) {
    return false;
  }

  if (latestWordCount <= 2 && !/[\u4e00-\u9fff]/.test(latestChildText)) {
    return false;
  }

  return true;
}

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
