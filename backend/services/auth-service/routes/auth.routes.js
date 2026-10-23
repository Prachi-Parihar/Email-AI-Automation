
import { Router } from "express";
import {
  register,
  verifyEmail,
  login,
  firebaseLogin,
  logout,
  logoutAll,
    getMe,
      forgotPassword,
  resetPassword
} from "../controllers/auth.controller.js";
import { isAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";

import {
  registerSchema,
  loginSchema,
  verifyEmailSchema
} from "../validators/auth.validator.js";

import {
  authRateLimiter,
  loginRateLimiter
} from "../middleware/rateLimit.middleware.js";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  register
);

router.post(
  "/firebase",
  loginRateLimiter,
  firebaseLogin
);

router.get("/me", isAuth, getMe);

router.post(
  "/verify-email",
  authRateLimiter,
  validate(verifyEmailSchema),
  verifyEmail
);

router.post(
  "/login",
  loginRateLimiter,
  validate(loginSchema),
  login
);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/logout", isAuth, logout);
router.post("/logout-all", isAuth, logoutAll);

export default router;
