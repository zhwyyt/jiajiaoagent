import fs from "node:fs";
import path from "node:path";
import {
  buildStartSessionResponse,
  buildTurnResponse
} from "../services/sessionService.js";
import type { StartSessionResponse, TurnMessage, TurnResponse } from "../types/session.js";

interface BridgeArgs {
  [key: string]: string | boolean;
}

interface BridgeInput {
  text: string;
  senderId: string;
  source: string;
  childId?: string;
  topicId?: string;
  currentLevel?: number;
}

interface SenderSessionState {
  sessionId: string;
  topicId: string;
  currentLevel: number;
  turnIndex: number;
  recentTurns: TurnMessage[];
  updatedAt: string;
}

interface BridgeState {
  sessionsBySender: Record<string, SenderSessionState>;
}

const DEFAULT_TOPIC_ID = "my-family";
const DEFAULT_CHILD_ID = "trial-child-001";
const DEFAULT_CURRENT_LEVEL = 2;
const STATE_FILE = path.resolve(process.cwd(), ".bridge-state.json");
const BRIDGE_LOG_FILE = path.resolve(process.cwd(), ".bridge-events.ndjson");

function parseArgs(argv: string[]): BridgeArgs {
  const parsed: BridgeArgs = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;

    const key = arg.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = next;
    index += 1;
  }

  return parsed;
}

function decodeInput(args: BridgeArgs): BridgeInput {
  if (typeof args["input-json-base64"] === "string") {
    const raw = Buffer.from(String(args["input-json-base64"]), "base64").toString("utf8");
    return JSON.parse(raw) as BridgeInput;
  }

  if (typeof args["input-json-file"] === "string") {
    const raw = fs.readFileSync(String(args["input-json-file"]), "utf8");
    return JSON.parse(raw) as BridgeInput;
  }

  return {
    text: String(args.text ?? "").trim(),
    senderId: String(args["sender-id"] ?? ""),
    source: String(args.source ?? "unknown"),
    childId: typeof args["child-id"] === "string" ? String(args["child-id"]) : undefined,
    topicId: typeof args["topic-id"] === "string" ? String(args["topic-id"]) : undefined,
    currentLevel:
      typeof args["current-level"] === "string" ? Number(args["current-level"]) : undefined
  };
}

function loadState(): BridgeState {
  try {
    if (!fs.existsSync(STATE_FILE)) {
      return { sessionsBySender: {} };
    }

    const raw = fs.readFileSync(STATE_FILE, "utf8");
    const parsed = JSON.parse(raw) as BridgeState;
    return {
      sessionsBySender: parsed.sessionsBySender ?? {}
    };
  } catch {
    return { sessionsBySender: {} };
  }
}

function saveState(state: BridgeState) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

function appendBridgeLog(event: Record<string, unknown>) {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    ...event
  });
  fs.appendFileSync(BRIDGE_LOG_FILE, `${line}\n`, "utf8");
}

function buildSenderKey(input: BridgeInput): string {
  return `${input.source || "unknown"}:${input.senderId || "anonymous"}`;
}

function buildOpeningReplyPayload(start: StartSessionResponse) {
  return {
    ok: true,
    handled: true,
    replyText: start.openingMessage,
    sessionId: start.sessionId,
    topicId: start.topicId,
    promptHint: null,
    shouldPlayTts: true,
    isSessionComplete: false,
    correction: {
      enabled: false,
      focus: null,
      mode: "none"
    }
  };
}

function buildTurnReplyPayload(
  sessionId: string,
  topicId: string,
  turn: TurnResponse
) {
  return {
    ok: true,
    handled: true,
    replyText: turn.agentReplyText,
    sessionId,
    topicId,
    promptHint: turn.promptHint,
    shouldPlayTts: turn.shouldPlayTts,
    isSessionComplete: turn.isSessionComplete,
    correction: turn.correction
  };
}

async function ensureSession(
  input: BridgeInput,
  state: BridgeState,
  createContainer: typeof import("../bootstrap/container.js").createContainer
) {
  const senderKey = buildSenderKey(input);
  const existing = state.sessionsBySender[senderKey];

  if (existing) {
    appendBridgeLog({
      type: "session_reused",
      senderKey,
      sessionId: existing.sessionId,
      topicId: existing.topicId,
      turnIndex: existing.turnIndex
    });
    return {
      senderKey,
      session: existing,
      openingPayload: null
    };
  }

  const container = await createContainer();
  const start = await buildStartSessionResponse(
    {
      childId: input.childId || DEFAULT_CHILD_ID,
      topicId: input.topicId || DEFAULT_TOPIC_ID,
      currentLevel: input.currentLevel ?? DEFAULT_CURRENT_LEVEL
    },
    container
  );

  const created: SenderSessionState = {
    sessionId: start.sessionId,
    topicId: start.topicId,
    currentLevel: input.currentLevel ?? DEFAULT_CURRENT_LEVEL,
    turnIndex: 0,
    recentTurns: [{ speaker: "agent", text: start.openingMessage }],
    updatedAt: new Date().toISOString()
  };

  state.sessionsBySender[senderKey] = created;
  saveState(state);
  appendBridgeLog({
    type: "session_created",
    senderKey,
    sessionId: created.sessionId,
    topicId: created.topicId,
    currentLevel: created.currentLevel
  });

  return {
    senderKey,
    session: created,
    openingPayload: buildOpeningReplyPayload(start)
  };
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const input = decodeInput(args);

  if (!process.env.MOCK_STORAGE && !process.env.DATABASE_URL && !process.env.REDIS_URL) {
    process.env.MOCK_STORAGE = "true";
  }

  const { createContainer } = await import("../bootstrap/container.js");

  if (!input.senderId) {
    throw new Error("senderId is required");
  }

  const state = loadState();
  const { senderKey, session, openingPayload } = await ensureSession(input, state, createContainer);

  if (!input.text) {
    appendBridgeLog({
      type: "opening_reply",
      senderKey,
      sessionId: session.sessionId,
      topicId: session.topicId,
      replyText: openingPayload?.replyText ?? session.recentTurns[0]?.text ?? ""
    });
    process.stdout.write(
      `${JSON.stringify(openingPayload ?? buildOpeningReplyPayload({
        sessionId: session.sessionId,
        topicId: session.topicId,
        openingMessage: session.recentTurns[0]?.text || "",
        suggestedReplyMode: "simple-question"
      }), null, 2)}\n`
    );
    return;
  }

  const container = await createContainer();
  const nextTurnIndex = session.turnIndex + 1;

  session.recentTurns.push({ speaker: "child", text: input.text });

  const turn = await buildTurnResponse(
    {
      sessionId: session.sessionId,
      topicId: session.topicId,
      turnIndex: nextTurnIndex,
      childUtteranceText: input.text,
      recentTurns: session.recentTurns
    },
    container
  );

  session.turnIndex = nextTurnIndex;
  session.recentTurns.push({ speaker: "agent", text: turn.agentReplyText });
  session.updatedAt = new Date().toISOString();

  if (turn.isSessionComplete) {
    delete state.sessionsBySender[senderKey];
  } else {
    state.sessionsBySender[senderKey] = session;
  }
  saveState(state);

  const payload = buildTurnReplyPayload(session.sessionId, session.topicId, turn);
  appendBridgeLog({
    type: "turn_reply",
    senderKey,
    sessionId: session.sessionId,
    topicId: session.topicId,
    turnIndex: nextTurnIndex,
    inputText: input.text,
    replyText: turn.agentReplyText,
    isSessionComplete: turn.isSessionComplete
  });
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  appendBridgeLog({
    type: "bridge_error",
    error: message
  });
  process.stderr.write(
    `${JSON.stringify({ ok: false, handled: false, error: message }, null, 2)}\n`
  );
  process.exitCode = 1;
});
