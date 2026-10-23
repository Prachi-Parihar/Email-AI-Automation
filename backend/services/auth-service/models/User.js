
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254
    },

    passwordHash: {
      type: String,
      default: null,
      select: false
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active"
    },

    // Email verification
    emailVerified: {
      type: Boolean,
      default: false
    },

    verificationTokenHash: {
      type: String,
      default: null,
      select: false
    },

    verificationTokenExpiresAt: {
      type: Date,
      default: null,
      select: false
    },
resetPasswordTokenHash: {
  type: String,
  default: null,
  select: false
},

resetPasswordExpiresAt: {
  type: Date,
  default: null,
  select: false
},
    firebaseUid: {
  type: String,
  unique: true,
  sparse: true,
  default: null
},
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.verificationTokenHash;
    delete ret.verificationTokenExpiresAt;
delete ret.resetPasswordTokenHash;
delete ret.resetPasswordExpiresAt;
    delete ret.__v;

    return ret;
  }
});

export const User = mongoose.model("User", userSchema);
