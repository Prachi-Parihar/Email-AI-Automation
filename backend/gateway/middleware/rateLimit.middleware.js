import { rateLimit } from "express-rate-limit";
import Redis from "ioredis";
import { RedisStore } from "rate-limit-redis";
import dotenv from "dotenv";

dotenv.config();
let redisClient;

if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: true
  })
  redisClient.on("connect", () => {
    console.log("Gateway Redis Connected")
  })
    redisClient.on("error", (err) => {
    console.error("Gateway Redis error:", err.message);
  });
} else {
  console.log("REDIS_URL not found. Using in-memory rate limiter.");
}

const createLimiter = ({ windowMs, limit, prefix }) => {
  const options = {
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false
  }

  if (redisClient) {
    options.store = new RedisStore({
      prefix,
      sendCommand: (...args) => redisClient.call(...args)
    });
  }

  return rateLimit(options);
}

export const globalLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 300,
  prefix: "gateway:global:"
})

export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  prefix: "gateway:login:"
})

export const closeRateLimitRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
  }
}