import dotenv from "dotenv";
import app from "./app.js";
import { closeRateLimitRedis } from "./middleware/rateLimit.middleware.js";

dotenv.config();
const PORT = Number(process.env.PORT) || 8000;

const server = app.listen(PORT, () => {
  console.log(`WorkFlow AI Gateway running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Gateway startup error:", error.message);
  process.exitCode = 1;
});

let shuttingDown = false;

const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`${signal} received. Closing Gateway...`);

  server.close(async (error) => {
    try {
      await closeRateLimitRedis();
    } catch {
      console.error("Redis connection could not close cleanly");
    }

    if (error) {
      console.error("Gateway shutdown error:", error.message);
      process.exitCode = 1;
    }
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));