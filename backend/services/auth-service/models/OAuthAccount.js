import mongoose from "mongoose";

const oauthAccountSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["google"],
      required: true
    },

    providerAccountId: {
      type: String,
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

oauthAccountSchema.index(
  { provider: 1, providerAccountId: 1 },
  { unique: true }
);

export const OAuthAccount = mongoose.model(
  "OAuthAccount",
  oauthAccountSchema
);