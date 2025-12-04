const mongoose = require("mongoose");

const postureLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  postureType: {
    type: String,
    enum: ["good", "moderate", "bad"],
    required: true,
  },
  duration: {
    type: Number, // in seconds
    required: true,
  },
  angle: {
    type: Number,
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: "",
  },
});

// Index for faster queries
postureLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model("PostureLog", postureLogSchema);
