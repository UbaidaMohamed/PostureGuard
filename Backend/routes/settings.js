const express = require("express");
const router = express.Router();
const UserSettings = require("../models/UserSettings");
const auth = require("../middleware/auth");

// Get user settings
router.get("/", auth, async (req, res) => {
  try {
    let settings = await UserSettings.findOne({ userId: req.user.userId });

    // Create default settings if none exist
    if (!settings) {
      settings = new UserSettings({ userId: req.user.userId });
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ error: "Error fetching settings" });
  }
});

// Update user settings
router.put("/", auth, async (req, res) => {
  try {
    const updates = req.body;
    updates.updatedAt = Date.now();

    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.json(settings);
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ error: "Error updating settings" });
  }
});

module.exports = router;
