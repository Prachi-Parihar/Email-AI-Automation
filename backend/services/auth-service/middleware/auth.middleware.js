
import { getSession } from "../service/session.service.js";

const COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME || "workflow_session";

export async function isAuth(req, res, next) {
  try {
    const sessionId = req.cookies?.[COOKIE_NAME];

    if (!sessionId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const session = await getSession(sessionId);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session expired or invalid"
      });
    }

    req.user = {
      id: session.userId,
      email: session.email,
      role: session.role
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    next();
  };
}
