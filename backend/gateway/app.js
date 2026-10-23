import express from "express";
import cors from "cors";
import helmet from "helmet";
import { randomUUID } from "node:crypto";

import proxyRoutes from "./routes/proxy.routes.js";
import {
  globalLimiter,
  loginLimiter
} from "./middleware/rateLimit.middleware.js";
import {
  notFound,
  errorHandler
} from "./middleware/error.middleware.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use((req, res, next) => {
  req.requestId = randomUUID();
  res.setHeader("x-request-id", req.requestId);
  next();
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "workflow-ai-gateway",
    status: "healthy"
  });
});

app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/register", loginLimiter);

app.use("/api", globalLimiter);

app.use(proxyRoutes);

app.use(express.json({ limit: "1mb" }));

app.use(notFound);
app.use(errorHandler);

export default app;