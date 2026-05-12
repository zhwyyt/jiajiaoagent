import fs from "node:fs";
import path from "node:path";

loadLocalEnv();

function getRequired(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getOptionalBoolean(name: string, defaultValue: boolean): boolean {
  const value = process.env[name];
  if (value == null) {
    return defaultValue;
  }

  return value.toLowerCase() === "true";
}

function getOptionalNumber(name: string, defaultValue: number): number {
  const value = process.env[name];
  if (value == null || value === "") {
    return defaultValue;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

export const env = {
  port: Number(process.env.PORT ?? 8787),
  mockStorage: getOptionalBoolean("MOCK_STORAGE", false),
  databaseUrl: process.env.DATABASE_URL ?? "",
  redisUrl: process.env.REDIS_URL ?? "",
  llmEnabled: getOptionalBoolean("LLM_ENABLED", true),
  llmModel: process.env.LLM_MODEL ?? process.env.GLM_MODEL ?? "glm-4.5-flash",
  llmBaseUrl: process.env.LLM_BASE_URL ?? "https://api.z.ai/api/paas/v4",
  llmApiKey: process.env.LLM_API_KEY ?? process.env.GLM_API_KEY ?? "",
  llmTemperature: getOptionalNumber("LLM_TEMPERATURE", 0.7),
  llmTimeoutMs: getOptionalNumber("LLM_TIMEOUT_MS", 20000)
};

export function requireDatabaseUrl(): string {
  return getRequired("DATABASE_URL");
}

export function requireRedisUrl(): string {
  return getRequired("REDIS_URL");
}

function loadLocalEnv(): void {
  const envFile = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envFile)) {
    return;
  }

  const raw = fs.readFileSync(envFile, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!key || process.env[key] != null) {
      continue;
    }

    process.env[key] = stripWrappingQuotes(value);
  }
}

function stripWrappingQuotes(value: string): string {
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
