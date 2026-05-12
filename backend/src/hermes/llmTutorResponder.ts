import { env } from "../config/env.js";
import fs from "node:fs";
import path from "node:path";
import type {
  ChildContext,
  LearnerProfile,
  TopicContext,
  TurnMessage,
  TurnRequest,
  TurnStrategy
} from "../types/session.js";

interface LlmTutorReply {
  replyText: string;
  promptHint: string | null;
}

interface OpenAiCompatibleResponse {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
}

interface OpenAiCompatibleStreamChunk {
  choices?: Array<{
    delta?: {
      content?: string | null;
    };
    finish_reason?: string | null;
  }>;
}

const BRIDGE_LOG_FILE = path.resolve(process.cwd(), ".bridge-events.ndjson");

export async function generateTutorReplyWithLlm(params: {
  request: TurnRequest;
  strategy: TurnStrategy;
  childContext: ChildContext;
  topicContext: TopicContext;
  learnerProfile?: LearnerProfile | null;
}): Promise<LlmTutorReply | null> {
  if (!env.llmEnabled || !env.llmApiKey) {
    appendLlmLog({
      type: "llm_skipped",
      reason: !env.llmEnabled ? "llm_disabled" : "missing_api_key",
      sessionId: params.request.sessionId,
      topicId: params.request.topicId,
      turnIndex: params.request.turnIndex
    });
    return null;
  }

  const { request, strategy, childContext, topicContext } = params;
  const url = buildChatCompletionsUrl(env.llmBaseUrl);
  const messages = [
    {
      role: "system",
      content: buildSystemPrompt()
    },
    {
      role: "user",
      content: buildUserPrompt(request, strategy, childContext, topicContext, params.learnerProfile)
    }
  ];

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.llmApiKey}`
    },
    body: JSON.stringify({
      model: env.llmModel,
      temperature: env.llmTemperature,
      messages,
      stream: true
    }),
    signal: AbortSignal.timeout(env.llmTimeoutMs)
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => "");
    appendLlmLog({
      type: "llm_failed",
      reason: "http_error",
      sessionId: request.sessionId,
      topicId: request.topicId,
      turnIndex: request.turnIndex,
      model: env.llmModel,
      status: response.status,
      statusText: response.statusText,
      responseText: responseText.slice(0, 500)
    });
    throw new Error(`LLM request failed: ${response.status} ${response.statusText}`);
  }

  const rawContent = await extractAssistantContentFromStream(response);
  if (!rawContent) {
    appendLlmLog({
      type: "llm_failed",
      reason: "empty_content",
      sessionId: request.sessionId,
      topicId: request.topicId,
      turnIndex: request.turnIndex,
      model: env.llmModel
    });
    return null;
  }

  appendLlmLog({
    type: "llm_succeeded",
    sessionId: request.sessionId,
    topicId: request.topicId,
    turnIndex: request.turnIndex,
    model: env.llmModel,
    replyPreview: rawContent.slice(0, 200)
  });

  return parseLlmTutorReply(rawContent);
}

function buildChatCompletionsUrl(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/+$/, "");
  if (trimmed.endsWith("/chat/completions")) {
    return trimmed;
  }
  return `${trimmed}/chat/completions`;
}

function buildSystemPrompt(): string {
  return [
    "You are a warm, natural English speaking buddy for a Chinese primary-school child.",
    "Your job is to sound like a real, patient foreign friend or tutor, not a scripted exam bot.",
    "Always respond to the child's real meaning first.",
    "In the first few turns, accept any topic naturally.",
    "Do not force the conversation into a preset topic if it does not fit.",
    "If the child sounds nervous, shy, stuck, or embarrassed, comfort them first and lower the pressure.",
    "Use short spoken English with simple words.",
    "Use 1 to 3 short sentences.",
    "Ask at most one simple follow-up question.",
    "Do not output lists, labels, analysis, roleplay tags, or teaching notes.",
    "Do not sound overly cheerful or fake.",
    "If the child mixes Chinese and English, understand it naturally and help gently.",
    "If the child does not understand your English, lower the difficulty immediately.",
    "When needed, you may add one very short Chinese support line after the English line.",
    "When the child is really stuck, you may let the child say the idea in Chinese first and then give one simple English version.",
    "Only suggest a topic softly after you have already replied like a real person.",
    "Treat stage goals, weekly focus, and session goals as silent guidance only. Do not say them out loud like lesson instructions.",
    "Return JSON only with this shape: {\"replyText\":\"...\",\"promptHint\":null}."
  ].join(" ");
}

function buildUserPrompt(
  request: TurnRequest,
  strategy: TurnStrategy,
  childContext: ChildContext,
  topicContext: TopicContext,
  learnerProfile?: LearnerProfile | null
): string {
  const transcript = formatRecentTurns(request.recentTurns);
  const softTopicGuide = [
    `soft topic title: ${topicContext.title}`,
    `soft topic goal: ${topicContext.communicationGoal}`,
    `soft topic follow-up examples: ${topicContext.followUpQuestions.join(" | ")}`
  ].join("\n");

  return [
    "Conversation context:",
    `child speaking level: ${childContext.currentSpeakingLevel}`,
    `encouragement style: ${childContext.encouragementStyle}`,
    `turn index: ${request.turnIndex}`,
    `current strategy mode: ${strategy.replyMode}`,
    `current strategy move: ${strategy.speakingMove}`,
    `current comprehension support mode: ${strategy.comprehensionSupportMode ?? "english-only"}`,
    `current stage goal: ${strategy.stageGoal ?? "unknown"}`,
    `current weekly focus: ${(strategy.weeklyFocus ?? []).join(" | ") || "none"}`,
    `current session goal: ${strategy.sessionGoal ?? "none"}`,
    `current support level: ${strategy.supportLevel ?? "unknown"}`,
    ...(learnerProfile
      ? [
          `learner profile hypothesis: ${learnerProfile.currentHypothesis}`,
          `learner preferred entry style: ${learnerProfile.stableTraits.preferredEntryStyle}`,
          `learner pressure sensitivity: ${learnerProfile.stableTraits.pressureSensitivity}`,
          `learner active supports: ${learnerProfile.activeSupports.join(" | ") || "none"}`
        ]
      : []),
    "",
    softTopicGuide,
    "",
    "Recent conversation:",
    transcript || "(no earlier turns)",
    "",
    `Latest child message: ${request.childUtteranceText}`,
    "",
    "Write the next tutor reply.",
    "Remember: reply naturally first, then only gently steer if it fits.",
    "Do not turn the internal goal into an explicit lesson announcement.",
    "Match the current comprehension support mode."
  ].join("\n");
}

function formatRecentTurns(turns: TurnMessage[]): string {
  return turns
    .slice(-6)
    .map((turn) => `${turn.speaker === "agent" ? "Tutor" : "Child"}: ${turn.text}`)
    .join("\n");
}

function parseLlmTutorReply(rawContent: string): LlmTutorReply {
  const maybeJson = extractJsonObject(rawContent);
  if (maybeJson) {
    try {
      const parsed = JSON.parse(maybeJson) as {
        replyText?: string;
        promptHint?: string | null;
      };
      const replyText = String(parsed.replyText ?? "").trim();
      if (replyText) {
        return {
          replyText,
          promptHint:
            typeof parsed.promptHint === "string" && parsed.promptHint.trim()
              ? parsed.promptHint.trim()
              : null
        };
      }
    } catch {
      // Fall through to plain text handling.
    }
  }

  return {
    replyText: rawContent.trim(),
    promptHint: null
  };
}

function extractJsonObject(value: string): string | null {
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return value.slice(start, end + 1);
}

async function extractAssistantContentFromStream(response: Response): Promise<string> {
  if (!response.body) {
    return "";
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    let separatorIndex = buffer.indexOf("\n\n");
    while (separatorIndex !== -1) {
      const rawEvent = buffer.slice(0, separatorIndex);
      buffer = buffer.slice(separatorIndex + 2);
      const chunkText = extractContentFromSseEvent(rawEvent);
      if (chunkText === "[DONE]") {
        return content.trim();
      }
      content += chunkText;
      separatorIndex = buffer.indexOf("\n\n");
    }
  }

  content += extractContentFromSseEvent(buffer);
  return content.trim();
}

function extractContentFromSseEvent(rawEvent: string): string {
  const trimmed = rawEvent.trim();
  if (!trimmed) {
    return "";
  }

  const dataLines = trimmed
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim());

  let result = "";
  for (const line of dataLines) {
    if (!line) {
      continue;
    }
    if (line === "[DONE]") {
      return "[DONE]";
    }

    try {
      const parsed = JSON.parse(line) as OpenAiCompatibleStreamChunk;
      for (const choice of parsed.choices ?? []) {
        result += choice.delta?.content ?? "";
      }
    } catch {
      // Ignore malformed SSE fragments.
    }
  }

  return result;
}

function appendLlmLog(event: Record<string, unknown>): void {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    ...event
  });

  try {
    fs.appendFileSync(BRIDGE_LOG_FILE, `${line}\n`, "utf8");
  } catch {
    // Best-effort logging only.
  }
}
