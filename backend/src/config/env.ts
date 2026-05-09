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

export const env = {
  port: Number(process.env.PORT ?? 8787),
  mockStorage: getOptionalBoolean("MOCK_STORAGE", false),
  databaseUrl: process.env.DATABASE_URL ?? "",
  redisUrl: process.env.REDIS_URL ?? ""
};

export function requireDatabaseUrl(): string {
  return getRequired("DATABASE_URL");
}

export function requireRedisUrl(): string {
  return getRequired("REDIS_URL");
}
