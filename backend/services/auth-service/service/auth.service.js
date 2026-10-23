
import bcrypt from "bcrypt";
import { randomBytes, createHash } from "node:crypto";
import { User } from "../models/User.js";
import { sendPasswordResetEmail } from "../config/mail.js";
import { sendVerificationEmail } from "../config/mail.js";
import {
  createSession,
  deleteSession,
  deleteAllUserSessions
} from "./session.service.js";

const generateToken = () => randomBytes(32).toString("hex");

const hashToken = (token) =>
  createHash("sha256").update(token).digest("hex");

export async function registerUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail
  });

  if (existingUser) {
    const error = new Error(
      "An account with this email already exists"
    );
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(
    password,
    Number(process.env.BCRYPT_ROUNDS || 12)
  );

  const token = generateToken();
  const tokenHash = hashToken(token);

  const expiresAt = new Date(
    Date.now() +
      Number(process.env.EMAIL_VERIFICATION_TTL_MINUTES || 15) *
        60 *
        1000
  );

  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    emailVerified: false,
    verificationTokenHash: tokenHash,
    verificationTokenExpiresAt: expiresAt
  });

  try {
    await sendVerificationEmail(user.email, token);
  } catch {
    await User.deleteOne({ _id: user._id });

    const error = new Error(
      "Unable to send verification email"
    );
    error.statusCode = 503;
    throw error;
  }

  return {
    message: "Registration successful. Please verify your email."
  };
}

export async function verifyUserEmail(token) {
  const user = await User.findOne({
    verificationTokenHash: hashToken(token),
    verificationTokenExpiresAt: { $gt: new Date() },
    emailVerified: false
  }).select(
    "+verificationTokenHash +verificationTokenExpiresAt"
  );

  if (!user) {
    const error = new Error(
      "Invalid or expired verification link"
    );
    error.statusCode = 400;
    throw error;
  }

  user.emailVerified = true;
  user.verificationTokenHash = null;
  user.verificationTokenExpiresAt = null;

  await user.save();

  return {
    message: "Email verified successfully"
  };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({
    email: email.trim().toLowerCase()
  }).select("+passwordHash");

  if (!user || !user.passwordHash) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (user.status !== "active") {
    const error = new Error("Your account is disabled");
    error.statusCode = 403;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.emailVerified) {
    const error = new Error(
      "Please verify your email before logging in"
    );
    error.statusCode = 403;
    throw error;
  }

  const session = await createSession(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    sessionId: session.sessionId,
    expiresIn: session.expiresIn
  };
}

export async function logoutUser(sessionId) {
  await deleteSession(sessionId);

  return {
    message: "Logged out successfully"
  };
}

export async function logoutAllUserSessions(userId) {
  await deleteAllUserSessions(userId.toString());

  return {
    message: "All sessions logged out successfully"
  };
}


export async function forgotPasswordUser(email) {
  const normalizedEmail = email?.trim().toLowerCase();

  const genericMessage =
    "If an account exists with this email, a password reset link will be sent.";

  if (!normalizedEmail) {
    return { message: genericMessage };
  }

  const user = await User.findOne({
    email: normalizedEmail,
    status: "active",
    emailVerified: true,
    passwordHash: { $ne: null }
  }).select("+passwordHash");

  if (!user) {
    return { message: genericMessage };
  }

  const token = generateToken();
  const tokenHash = hashToken(token);

  user.resetPasswordTokenHash = tokenHash;
  user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await user.save();

  try {
    await sendPasswordResetEmail(user.email, token);
  } catch (error) {
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    const mailError = new Error("Unable to send password reset email");
    mailError.statusCode = 503;
    throw mailError;
  }

  return { message: genericMessage };
}

export async function resetPasswordUser({ token, password }) {
  if (!token || typeof password !== "string" || password.length < 8) {
    const error = new Error(
      "A valid token and password of at least 8 characters are required"
    );
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({
    resetPasswordTokenHash: hashToken(token),
    resetPasswordExpiresAt: { $gt: new Date() },
    status: "active"
  }).select("+resetPasswordTokenHash +resetPasswordExpiresAt");

  if (!user) {
    const error = new Error("Invalid or expired password reset link");
    error.statusCode = 400;
    throw error;
  }

  user.passwordHash = await bcrypt.hash(
    password,
    Number(process.env.BCRYPT_ROUNDS || 12)
  );

  user.resetPasswordTokenHash = null;
  user.resetPasswordExpiresAt = null;

  await user.save();

  // Invalidate existing sessions after a password change.
  await deleteAllUserSessions(user._id.toString());

  return {
    message: "Password reset successfully. Please log in again."
  };
}

