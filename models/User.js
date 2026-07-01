const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    budget: {
      type: Number,
      default: 0,
      min: 0,
    },
    otp: {
      type: String,
    },

    otpExpiry: {
      type: Date,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    resetOtp: String,
    resetOtpExpiry: Date,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
