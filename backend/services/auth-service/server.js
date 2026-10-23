
import "dotenv/config";

import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import {
  connectRedis,
  disconnectRedis
} from "./config/redis.js";

const PORT = Number(process.env.PORT || 8001);

let server;

async function startServer() {
  try {
    await connectDB();
    await connectRedis();

    server = app.listen(PORT, () => {
      console.log(`Auth Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Auth Service:", error.message);

    await Promise.allSettled([
      disconnectRedis(),
      disconnectDB()
    ]);

    process.exitCode = 1;
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down Auth Service...`);

  if (server) {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  }

  await Promise.allSettled([
    disconnectRedis(),
    disconnectDB()
  ]);

  process.exit(0);
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

startServer();
