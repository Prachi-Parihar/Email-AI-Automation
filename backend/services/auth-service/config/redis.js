import Redis from "ioredis";

let redis;

export function getRedis() {
  if (!redis) {
    if (!process.env.REDIS_URL) {
      throw new Error("REDIS_URL is required");
    }

    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      lazyConnect: true
    });

    redis.on("error", (error) => {
      console.error("Redis connection error:", error.message);
    });
  }

  return redis;
}

export async function connectRedis() {
  const client = getRedis();

  if (client.status === "wait") {
    await client.connect();
  }

  await client.ping();
  console.log("Redis connected");
}

export async function disconnectRedis() {
  if (redis && redis.status !== "end") {
    await redis.quit();
  }
}