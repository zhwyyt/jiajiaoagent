import { createClient, type RedisClientType } from "redis";
import { requireRedisUrl } from "../../config/env.js";

let client: RedisClientType | null = null;

export function getRedisClient(): RedisClientType {
  if (!client) {
    client = createClient({
      url: requireRedisUrl()
    });
  }

  return client;
}
