import {
  forgotPasswordUser,
  resetPasswordUser
} from "../service/auth.service.js";
import {
  registerUser,
  verifyUserEmail,
  loginUser,
  logoutUser,
  logoutAllUserSessions
} from "../service/auth.service.js";

import {
  firebaseLogin as firebaseLoginService
} from "../service/firebaseAuth.service.js";

const COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME || "workflow_session";

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.SESSION_COOKIE_SECURE === "true",
  sameSite: process.env.SESSION_COOKIE_SAME_SITE || "lax",
  path: "/"
});

export async function register(req, res, next) {
  try {
    const result = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const result = await verifyUserEmail(req.body.token);

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginUser(req.body);

    res.cookie(COOKIE_NAME, result.sessionId, {
      ...cookieOptions(),
      maxAge: result.expiresIn * 1000
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: result.user
    });
  } catch (error) {
    next(error);
  }
}

export async function firebaseLogin(req, res, next) {
  try {
    const result = await firebaseLoginService(req.body.idToken);

    res.cookie(COOKIE_NAME, result.sessionId, {
      ...cookieOptions(),
      maxAge: result.expiresIn * 1000
    });

    return res.status(200).json({
      success: true,
      message: "Firebase login successful",
      user: result.user
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const sessionId = req.cookies?.[COOKIE_NAME];

    await logoutUser(sessionId);
    res.clearCookie(COOKIE_NAME, cookieOptions());

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    next(error);
  }
}

export async function logoutAll(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    await logoutAllUserSessions(userId);
    res.clearCookie(COOKIE_NAME, cookieOptions());

    return res.status(200).json({
      success: true,
      message: "All sessions logged out successfully"
    });
  } catch (error) {
    next(error);
  }
}



export async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user
  });
}


export async function forgotPassword(req, res, next) {
  try {
    const result = await forgotPasswordUser(req.body.email);

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
}


export async function resetPassword(req, res, next) {
  try {
    const result = await resetPasswordUser({
      token: req.params.token,
      password: req.body.password
    });

    res.clearCookie(COOKIE_NAME, cookieOptions());

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
}
