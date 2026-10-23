import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { services } from "../config/services.config.js";
import { requireCredentials } from "../middleware/auth.middleware.js";

const router = express.Router();

const createServiceProxy = (target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,

    pathRewrite: (_path, req) => req.originalUrl,

    on: {
      proxyReq: (proxyReq, req) => {
        proxyReq.setHeader("x-request-id", req.requestId);

        proxyReq.removeHeader("x-user-id");
        proxyReq.removeHeader("x-user-role");
        proxyReq.removeHeader("x-organization-id");
      },

      error: (_error, _req, res) => {
        if (!res.headersSent) {
          res.writeHead(502, {
            "Content-Type": "application/json"
          });
          res.end(JSON.stringify({
            success: false,
            message: "Upstream service unavailable"
          }))
        }
      }
    }
  })

router.use("/api/auth", createServiceProxy(services.auth));

router.use(
  "/api/emails/webhooks/gmail",
  createServiceProxy(services.email)
);

router.use(
  "/api/organizations",
  requireCredentials,
  createServiceProxy(services.organization)
);

router.use(
  "/api/emails",
  requireCredentials,
  createServiceProxy(services.email)
);

router.use(
  "/api/ai",
  requireCredentials,
  createServiceProxy(services.ai)
);

router.use(
  "/api/tasks",
  requireCredentials,
  createServiceProxy(services.task)
);

router.use(
  "/api/replies",
  requireCredentials,
  createServiceProxy(services.reply)
);

router.use(
  "/api/notifications",
  requireCredentials,
  createServiceProxy(services.notification)
);

router.use(
  "/api/analytics",
  requireCredentials,
  createServiceProxy(services.analytics)
);

export default router;