import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { encode as encodeSilk, getWavFileInfo } from "silk-wasm";
import type { AppContainer } from "../bootstrap/container.js";
import {
  buildParentReportResponse,
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
  speechRatePreset: string;
  turnIndex: number;
  recentTurns: TurnMessage[];
  updatedAt: string;
}

interface BridgeState {
  sessionsBySender: Record<string, SenderSessionState>;
}

interface BridgeReplyPayload {
  ok: true;
  handled: true;
  replyText: string;
  sessionId: string;
  topicId: string;
  promptHint: string | null;
  shouldPlayTts: boolean;
  isSessionComplete: boolean;
  correction: {
    enabled: boolean;
    focus: string | null;
    mode: "none" | "gentle";
  };
  files?: Array<{
    path: string;
    kind: "voice";
    format: "silk" | "wav";
    durationMs?: number;
    playtimeSeconds?: number;
  }>;
}

interface RestartChatCommand {
  replyText: string;
}

interface ParentReportCommand {
  normalized: string;
}

const DEFAULT_TOPIC_ID = "my-family";
const DEFAULT_CHILD_ID = "trial-child-001";
const DEFAULT_CURRENT_LEVEL = 2;
const STATE_FILE = path.resolve(process.cwd(), ".bridge-state.json");
const BRIDGE_LOG_FILE = path.resolve(process.cwd(), ".bridge-events.ndjson");
const AUDIO_OUTPUT_DIR = path.resolve(process.cwd(), ".bridge-audio");
const TTS_SCRIPT_FILE = path.resolve(process.cwd(), "scripts", "synthesize-bridge-tts.ps1");
const TTS_CONFIG_FILE = path.resolve(process.cwd(), "..", "config", "tts-voice.json");

interface TtsVoiceConfig {
  speechRatePreset?: string;
  presets?: Record<string, number>;
}

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

function sanitizeFilePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "anon";
}

function buildAudioOutputPath(
  senderKey: string,
  sessionId: string,
  turnLabel: string,
  extension: ".wav" | ".silk"
): string {
  const safeSenderKey = sanitizeFilePart(senderKey);
  const safeSessionId = sanitizeFilePart(sessionId);
  const safeTurnLabel = sanitizeFilePart(turnLabel);
  const fileName = `${Date.now()}-${safeSenderKey}-${safeSessionId}-${safeTurnLabel}${extension}`;
  fs.mkdirSync(AUDIO_OUTPUT_DIR, { recursive: true });
  return path.join(AUDIO_OUTPUT_DIR, fileName);
}

function toWslPath(filePath: string): string {
  const normalized = path.resolve(filePath);
  const driveMatch = normalized.match(/^([A-Za-z]):\\(.*)$/);
  if (!driveMatch) {
    return normalized.replace(/\\/g, "/");
  }

  const drive = driveMatch[1].toLowerCase();
  const rest = driveMatch[2].replace(/\\/g, "/");
  return `/mnt/${drive}/${rest}`;
}

function loadTtsVoiceConfig(): { presetName: string; rate: number } {
  const fallback = {
    presetName: "normal",
    rate: 0
  };

  try {
    if (!fs.existsSync(TTS_CONFIG_FILE)) {
      return fallback;
    }

    const raw = fs.readFileSync(TTS_CONFIG_FILE, "utf8");
    const parsed = JSON.parse(raw) as TtsVoiceConfig;
    const presetName = String(parsed.speechRatePreset || fallback.presetName);
    const presets = parsed.presets ?? {};
    const rate = Number.isFinite(presets[presetName]) ? Number(presets[presetName]) : fallback.rate;

    return {
      presetName,
      rate
    };
  } catch {
    return fallback;
  }
}

function resolveSpeechRateConfig(
  sessionSpeechRatePreset?: string
): { presetName: string; rate: number } {
  const fallback = loadTtsVoiceConfig();

  try {
    if (!fs.existsSync(TTS_CONFIG_FILE)) {
      return fallback;
    }

    const raw = fs.readFileSync(TTS_CONFIG_FILE, "utf8");
    const parsed = JSON.parse(raw) as TtsVoiceConfig;
    const presets = parsed.presets ?? {};
    const requestedPreset = String(sessionSpeechRatePreset || parsed.speechRatePreset || fallback.presetName);
    const rate = Number.isFinite(presets[requestedPreset]) ? Number(presets[requestedPreset]) : fallback.rate;

    return {
      presetName: requestedPreset,
      rate
    };
  } catch {
    return fallback;
  }
}

function parseSpeechRateCommand(text: string): { presetName: string; replyText: string } | null {
  const normalized = text.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const slowPatterns = [
    "改成慢",
    "改成慢速",
    "调慢",
    "说慢一点",
    "再慢一点",
    "慢一点",
    "用慢速",
    "slow speed",
    "speak slower",
    "slower",
    "slow"
  ];
  const normalPatterns = [
    "改成正常",
    "改回正常",
    "恢复正常",
    "正常语速",
    "正常一点",
    "用正常",
    "normal speed",
    "speak normally",
    "normal"
  ];
  const fastPatterns = [
    "改成快",
    "改成快速",
    "调快",
    "说快一点",
    "再快一点",
    "快一点",
    "用快速",
    "fast speed",
    "speak faster",
    "faster",
    "fast"
  ];

  if (slowPatterns.some((pattern) => normalized.includes(pattern))) {
    return {
      presetName: "slow",
      replyText: "Okay, I will speak more slowly now."
    };
  }

  if (normalPatterns.some((pattern) => normalized.includes(pattern))) {
    return {
      presetName: "normal",
      replyText: "Okay, I will use a normal speaking speed now."
    };
  }

  if (fastPatterns.some((pattern) => normalized.includes(pattern))) {
    return {
      presetName: "fast",
      replyText: "Okay, I will speak a little faster now."
    };
  }

  return null;
}

function parseRestartChatCommand(text: string): RestartChatCommand | null {
  const normalized = text.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const restartPatterns = [
    "重新开始聊天",
    "重新开始",
    "重新聊",
    "重新开聊",
    "重新来",
    "开始新聊天",
    "开始新的聊天",
    "new chat",
    "start over",
    "restart chat",
    "reset chat"
  ];

  if (restartPatterns.some((pattern) => normalized.includes(pattern))) {
    return {
      replyText: "Okay, let's start a new chat now."
    };
  }

  return null;
}

function parseParentReportCommand(text: string): ParentReportCommand | null {
  const normalized = text.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const patterns = [
    "家长报告",
    "学习报告",
    "成长报告",
    "本周报告",
    "报告",
    "parent report",
    "learning report",
    "progress report"
  ];

  if (patterns.some((pattern) => normalized === pattern || normalized.includes(pattern))) {
    return { normalized };
  }

  return null;
}

function synthesizeSpeechToWave(text: string, outputPath: string, rate: number): void {
  const textBase64 = Buffer.from(text, "utf8").toString("base64");
  const outputPathBase64 = Buffer.from(outputPath, "utf8").toString("base64");
  if (!fs.existsSync(TTS_SCRIPT_FILE)) {
    throw new Error(`TTS script not found: ${TTS_SCRIPT_FILE}`);
  }

  const result = spawnSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      TTS_SCRIPT_FILE,
      "-TextBase64",
      textBase64,
      "-OutputPathBase64",
      outputPathBase64,
      "-Rate",
      String(rate)
    ],
    {
      encoding: "utf8"
    }
  );

  if (result.status !== 0) {
    const stderr = result.stderr?.trim();
    const stdout = result.stdout?.trim();
    throw new Error(stderr || stdout || "PowerShell TTS failed");
  }
}

async function convertWaveToSilk(
  wavePath: string,
  silkPath: string
): Promise<{ durationMs: number; playtimeSeconds: number }> {
  const waveBytes = fs.readFileSync(wavePath);
  const wavInfo = getWavFileInfo(waveBytes);
  const {
    numberOfChannels,
    sampleRate,
    bitsPerSample
  } = wavInfo.fmt;
  const dataChunk = wavInfo.chunkInfo.find((chunk) => chunk.chunkId === "data");

  if (!dataChunk) {
    throw new Error("WAV data chunk not found");
  }
  if (numberOfChannels !== 1) {
    throw new Error(`Expected mono WAV for SILK encode, got channels=${numberOfChannels}`);
  }
  if (bitsPerSample !== 16) {
    throw new Error(`Expected 16-bit WAV for SILK encode, got bits=${bitsPerSample}`);
  }

  const pcmSource = waveBytes.subarray(
    dataChunk.dataOffset,
    dataChunk.dataOffset + dataChunk.dataLength
  );
  const targetSampleRate = 24000;

  let pcmForEncode = pcmSource;
  if (sampleRate !== targetSampleRate) {
    const inputSamples = pcmSource.length / 2;
    const outputSamples = Math.max(
      1,
      Math.round((inputSamples * targetSampleRate) / sampleRate)
    );
    const resampled = Buffer.alloc(outputSamples * 2);

    for (let outputIndex = 0; outputIndex < outputSamples; outputIndex += 1) {
      const sourcePosition = (outputIndex * sampleRate) / targetSampleRate;
      const leftIndex = Math.floor(sourcePosition);
      const rightIndex = Math.min(leftIndex + 1, inputSamples - 1);
      const fraction = sourcePosition - leftIndex;
      const leftValue = pcmSource.readInt16LE(leftIndex * 2);
      const rightValue = pcmSource.readInt16LE(rightIndex * 2);
      const interpolated = Math.round(leftValue + (rightValue - leftValue) * fraction);
      resampled.writeInt16LE(interpolated, outputIndex * 2);
    }

    pcmForEncode = resampled;
  }

  const result = await encodeSilk(pcmForEncode, targetSampleRate);
  const silkBytes = Buffer.from(result.data);
  fs.writeFileSync(silkPath, silkBytes);

  const durationMs = Math.max(1, Math.round(result.duration));
  const playtimeSeconds = Math.max(1, Math.round(durationMs / 1000));
  return {
    durationMs,
    playtimeSeconds
  };
}

async function attachVoiceFile(
  payload: BridgeReplyPayload,
  senderKey: string,
  turnLabel: string,
  speechRatePreset?: string
): Promise<BridgeReplyPayload> {
  if (!payload.shouldPlayTts || !payload.replyText.trim()) {
    return payload;
  }

  try {
    const wavePath = buildAudioOutputPath(senderKey, payload.sessionId, turnLabel, ".wav");
    const silkPath = buildAudioOutputPath(senderKey, payload.sessionId, turnLabel, ".silk");
    const ttsVoiceConfig = resolveSpeechRateConfig(speechRatePreset);
    synthesizeSpeechToWave(payload.replyText, wavePath, ttsVoiceConfig.rate);
    const { durationMs, playtimeSeconds } = await convertWaveToSilk(wavePath, silkPath);
    return {
      ...payload,
      files: [
        {
          path: toWslPath(silkPath),
          kind: "voice",
          format: "silk",
          durationMs,
          playtimeSeconds
        }
      ]
    };
  } catch (error: unknown) {
    appendBridgeLog({
      type: "tts_generation_failed",
      senderKey,
      sessionId: payload.sessionId,
      topicId: payload.topicId,
      turnLabel,
      error: error instanceof Error ? error.message : String(error)
    });
    return payload;
  }
}

function buildOpeningReplyPayload(start: StartSessionResponse): BridgeReplyPayload {
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
): BridgeReplyPayload {
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
  createContainer: () => Promise<AppContainer>
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
    speechRatePreset: loadTtsVoiceConfig().presetName,
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

async function restartSession(
  input: BridgeInput,
  state: BridgeState,
  createContainer: () => Promise<AppContainer>
) {
  const senderKey = buildSenderKey(input);
  delete state.sessionsBySender[senderKey];
  saveState(state);
  appendBridgeLog({
    type: "session_reset",
    senderKey
  });

  return ensureSession(input, state, createContainer);
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const input = decodeInput(args);

  if (!process.env.MOCK_STORAGE && !process.env.DATABASE_URL && !process.env.REDIS_URL) {
    process.env.MOCK_STORAGE = "true";
  }

  const { createContainer: createBaseContainer } = await import("../bootstrap/container.js");
  const activeContainers: AppContainer[] = [];

  const createTrackedContainer = async (): Promise<AppContainer> => {
    const container = await createBaseContainer();
    activeContainers.push(container);
    return container;
  };

  try {
    if (!input.senderId) {
      throw new Error("senderId is required");
    }

    const state = loadState();
    const restartChatCommand = input.text ? parseRestartChatCommand(input.text) : null;
    const parentReportCommand = !restartChatCommand && input.text ? parseParentReportCommand(input.text) : null;
    const sessionBundle = restartChatCommand
      ? await restartSession(input, state, createTrackedContainer)
      : await ensureSession(input, state, createTrackedContainer);
    const { senderKey, session, openingPayload } = sessionBundle;

    if (!input.text) {
      const responsePayload = await attachVoiceFile(
        openingPayload ?? buildOpeningReplyPayload({
          sessionId: session.sessionId,
          topicId: session.topicId,
          openingMessage: session.recentTurns[0]?.text || "",
          suggestedReplyMode: "simple-question"
        }),
        senderKey,
        "opening",
        session.speechRatePreset
      );
      appendBridgeLog({
        type: "opening_reply",
        senderKey,
        sessionId: session.sessionId,
        topicId: session.topicId,
        replyText: responsePayload.replyText,
        files: responsePayload.files ?? []
      });
      process.stdout.write(`${JSON.stringify(responsePayload, null, 2)}\n`);
      return;
    }

    const container = await createTrackedContainer();
    const nextTurnIndex = session.turnIndex + 1;
    const speechRateCommand = parseSpeechRateCommand(input.text);

    if (restartChatCommand) {
      const openingText = openingPayload?.replyText ?? session.recentTurns[0]?.text ?? restartChatCommand.replyText;
      const payload = await attachVoiceFile(
        {
          ok: true,
          handled: true,
          replyText: `${restartChatCommand.replyText} ${openingText}`.trim(),
          sessionId: session.sessionId,
          topicId: session.topicId,
          promptHint: "You can start with any question or topic you like.",
          shouldPlayTts: true,
          isSessionComplete: false,
          correction: {
            enabled: false,
            focus: null,
            mode: "none"
          }
        },
        senderKey,
        "restart",
        session.speechRatePreset
      );

      process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
      return;
    }

    if (speechRateCommand) {
      session.speechRatePreset = speechRateCommand.presetName;
      session.updatedAt = new Date().toISOString();
      state.sessionsBySender[senderKey] = session;
      saveState(state);

      const payload = await attachVoiceFile(
        {
          ok: true,
          handled: true,
          replyText: speechRateCommand.replyText,
          sessionId: session.sessionId,
          topicId: session.topicId,
          promptHint: "You can change the speed again by saying slow, normal, or fast.",
          shouldPlayTts: true,
          isSessionComplete: false,
          correction: {
            enabled: false,
            focus: null,
            mode: "none"
          }
        },
        senderKey,
        `speed-${speechRateCommand.presetName}`,
        session.speechRatePreset
      );

      appendBridgeLog({
        type: "speech_rate_changed",
        senderKey,
        sessionId: session.sessionId,
        topicId: session.topicId,
        presetName: speechRateCommand.presetName
      });

      process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
      return;
    }

    if (parentReportCommand) {
      const reportResponse = await buildParentReportResponse(
        {
          childId: input.childId || DEFAULT_CHILD_ID,
          topicId: session.topicId || input.topicId || DEFAULT_TOPIC_ID,
          sessionId: session.sessionId
        },
        container
      );

      const payload = buildTurnReplyPayload(session.sessionId, session.topicId, reportResponse);
      appendBridgeLog({
        type: "parent_report_reply",
        senderKey,
        sessionId: session.sessionId,
        topicId: session.topicId,
        inputText: input.text,
        replyText: reportResponse.agentReplyText
      });
      process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
      return;
    }

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

    const payload = await attachVoiceFile(
      buildTurnReplyPayload(session.sessionId, session.topicId, turn),
      senderKey,
      `turn-${nextTurnIndex}`,
      session.speechRatePreset
    );
    appendBridgeLog({
      type: "turn_reply",
      senderKey,
      sessionId: session.sessionId,
      topicId: session.topicId,
      turnIndex: nextTurnIndex,
      inputText: input.text,
      replyText: turn.agentReplyText,
      source: turn.source ?? "fallback",
      isSessionComplete: turn.isSessionComplete,
      files: payload.files ?? []
    });
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  } finally {
    const shutdownErrors: string[] = [];

    while (activeContainers.length > 0) {
      const container = activeContainers.pop();
      if (!container) {
        continue;
      }

      try {
        await container.shutdown();
      } catch (error: unknown) {
        shutdownErrors.push(error instanceof Error ? error.message : String(error));
      }
    }

    if (shutdownErrors.length > 0) {
      appendBridgeLog({
        type: "bridge_shutdown_error",
        errors: shutdownErrors
      });
    }
  }
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
