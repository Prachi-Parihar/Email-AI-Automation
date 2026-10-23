import { randomBytes } from "node:crypto";
import { getRedis } from "../config/redis.js";

const SESSION_TTL = Number(
  process.env.SESSION_TTL_SECONDS || 604800
);

const sessionKey = (sessionId) => `session:${sessionId}`;

export async function createSession(user) {
  const redis = getRedis();
  const sessionId = randomBytes(32).toString("hex");

  const sessionData = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role
  };

  await redis.set(
    sessionKey(sessionId),
    JSON.stringify(sessionData),
    "EX",
    SESSION_TTL
  );

  return {
    sessionId,
    expiresIn: SESSION_TTL
  };
}

export async function getSession(sessionId) {
  if (!sessionId) return null;

  const redis = getRedis();
  const session = await redis.get(sessionKey(sessionId));

  if (!session) return null;

  return JSON.parse(session);
}

export async function deleteSession(sessionId) {
  if (!sessionId) return;

  const redis = getRedis();
  await redis.del(sessionKey(sessionId));
}

export async function deleteAllUserSessions(userId) {
  const redis = getRedis();
  const pattern = "session:*";
  let cursor = "0";

  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      100
    );

    cursor = nextCursor;

    if (keys.length === 0) continue;

    const values = await redis.mget(...keys);
    const matchingKeys = [];

    keys.forEach((key, index) => {
      if (!values[index]) return;

      try {
        const session = JSON.parse(values[index]);

        if (session.userId === userId.toString()) {
          matchingKeys.push(key);
        }
      } catch {
        // Ignore invalid session data.
      }
    });

    if (matchingKeys.length > 0) {
      await redis.del(...matchingKeys);
    }
  } while (cursor !== "0");
}
