import type { TurnRequest, TurnResponse } from "../types/session.js";

interface QuickIntentResponse {
  agentReplyText: string;
  promptHint: string | null;
}

export function getQuickIntentResponse(
  request: TurnRequest
): QuickIntentResponse | null {
  const utterance = request.childUtteranceText.trim();
  const normalized = normalizeQuickIntentText(utterance);

  if (matchesExactIntent(normalized, ["who are you", "who r you", "what are you"])) {
    return {
      agentReplyText:
        "I am your English speaking buddy. I can talk with you and help you practice English. What would you like to talk about?",
      promptHint: "You can ask me a question, tell me something about your day, or choose a topic."
    };
  }

  if (matchesExactIntent(normalized, ["what can you do", "what do you do", "how can you help"])) {
    return {
      agentReplyText:
        "I can chat with you in English, help you say full sentences, and practice topics like family, food, school, and hobbies. What topic do you want to try?",
      promptHint: "You can start with any simple idea, question, or topic you like."
    };
  }

  if (matchesExactIntent(normalized, ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"])) {
    return {
      agentReplyText:
        "Hello! I am happy to talk with you in English today. What would you like to talk about?",
      promptHint: "You can start with any question or topic you like."
    };
  }

  if (matchesExactIntent(normalized, ["bye", "goodbye", "see you", "see you later"])) {
    return {
      agentReplyText:
        "Bye! You did a good job talking with me today. See you next time.",
      promptHint: null
    };
  }

  if (matchesExactIntent(normalized, ["thank you", "thanks", "thank you so much"])) {
    return {
      agentReplyText:
        "You are welcome! You are doing a good job. Do you want to keep talking?",
      promptHint: "You can say yes and choose a topic."
    };
  }

  if (matchesExactIntent(normalized, ["i don't know", "i dont know", "don't know", "dont know"])) {
    return {
      agentReplyText:
        "That is okay. Let's make it easier. I can give you two choices. Do you want to talk about family or food?",
      promptHint: "You can answer with one short idea, or I can give you a topic."
    };
  }

  if (
    matchesExactIntent(normalized, [
      "i can't say it",
      "i cant say it",
      "i can't speak",
      "i cant speak",
      "i don't know how to say it",
      "i dont know how to say it"
    ])
  ) {
    return {
      agentReplyText:
        "That is okay. You can say one Chinese word first, and then I will help you say the full English sentence.",
      promptHint: "If you get stuck, say the key word first."
    };
  }

  return null;
}

function matchesExactIntent(normalized: string, patterns: string[]): boolean {
  return patterns.some((pattern) => normalized === normalizeQuickIntentText(pattern));
}

function normalizeQuickIntentText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[!?.,]+$/g, "")
    .replace(/\s+/g, " ");
}

export function buildQuickIntentTurnResponse(
  request: TurnRequest,
  quickResponse: QuickIntentResponse
): TurnResponse {
  return {
    sessionId: request.sessionId,
    agentReplyText: quickResponse.agentReplyText,
    shouldPlayTts: true,
    source: "quick-intent",
    correction: {
      enabled: false,
      focus: null,
      mode: "none"
    },
    promptHint: quickResponse.promptHint,
    isSessionComplete: false
  };
}
