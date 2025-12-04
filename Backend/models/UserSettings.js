const mongoose = require("mongoose");

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  notifications: {
    enabled: {
      type: Boolean,
      default: true,
    },
    frequency: {
      type: String,
      enum: ["immediate", "every-5-min", "every-15-min", "hourly"],
      default: "every-5-min",
    },
  },
  thresholds: {
    goodPostureAngle: {
      type: Number,
      default: 90,
    },
    warningDuration: {
      type: Number,
      default: 300, // 5 minutes in seconds
    },
  },
  reminders: {
    breakReminder: {
      type: Boolean,
      default: true,
    },
    breakInterval: {
      type: Number,
      default: 30, // minutes
    },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("UserSettings", userSettingsSchema);
