const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

// Note: Video streaming is handled by Django WebSocket
// This route is kept for potential future features

router.get("/status", auth, (req, res) => {
  res.json({
    message:
      "Video streaming is handled by Django WebSocket at ws://localhost:8000/ws/posture/",
    status: "active",
  });
});

module.exports = router;
