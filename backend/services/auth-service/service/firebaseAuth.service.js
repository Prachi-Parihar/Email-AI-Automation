
import { getAuth } from "firebase-admin/auth";
import { app } from "../config/firebase.js";
import { User } from "../models/User.js";
import { createSession } from "./session.service.js";

export async function firebaseLogin(idToken) {
  if (!idToken) {
    const error = new Error("Firebase ID token is required");
    error.statusCode = 400;
    throw error;
  }

  const decodedToken = await getAuth(app).verifyIdToken(idToken);

  const firebaseUid = decodedToken.uid;
  const email = decodedToken.email?.trim().toLowerCase();

  if (!email || !decodedToken.email_verified) {
    const error = new Error("Please verify your email first");
    error.statusCode = 401;
    throw error;
  }

  let user = await User.findOne({ firebaseUid });

  if (!user) {
    user = await User.findOne({ email });

    if (user) {
      const error = new Error(
        "An account with this email already exists. Please use your existing login method."
      );
      error.statusCode = 409;
      throw error;
    }

    user = await User.create({
      name: decodedToken.name || email.split("@")[0],
      email,
      firebaseUid,
      emailVerified: true
    });
  }

  if (user.status !== "active") {
    const error = new Error("Your account is disabled");
    error.statusCode = 403;
    throw error;
  }

  if (!user.emailVerified) {
    user.emailVerified = true;
    await user.save();
  }

  const session = await createSession(user);

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    },
    sessionId: session.sessionId,
    expiresIn: session.expiresIn
  };
}
