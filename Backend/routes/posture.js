const express = require("express");
const router = express.Router();
const PostureLog = require("../models/PostureLog");
const auth = require("../middleware/auth");

// Get all posture logs for user
router.get("/logs", auth, async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;

    const query = { userId: req.user.userId };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await PostureLog.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({ data: logs });
  } catch (error) {
    console.error("Get logs error:", error);
    res.status(500).json({ error: "Error fetching posture logs" });
  }
});

// Create posture log
router.post("/logs", auth, async (req, res) => {
  try {
    const { postureType, duration, angle, notes } = req.body;

    const log = new PostureLog({
      userId: req.user.userId,
      postureType,
      duration,
      angle,
      notes,
    });

    await log.save();
    res.status(201).json(log);
  } catch (error) {
    console.error("Create log error:", error);
    res.status(500).json({ error: "Error creating posture log" });
  }
});

// Get dashboard stats
router.get("/dashboard/stats", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get latest log
    const latestLog = await PostureLog.findOne({ userId }).sort({
      timestamp: -1,
    });

    // Get weekly average
    const weeklyLogs = await PostureLog.find({
      userId,
      timestamp: { $gte: weekAgo },
    });

    const weeklyAverage =
      weeklyLogs.length > 0
        ? weeklyLogs.reduce((sum, log) => sum + (log.angle || 90), 0) /
          weeklyLogs.length
        : 90;

    // Get previous week average for comparison
    const twoWeeksAgo = new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prevWeekLogs = await PostureLog.find({
      userId,
      timestamp: { $gte: twoWeeksAgo, $lt: weekAgo },
    });

    const prevWeekAverage =
      prevWeekLogs.length > 0
        ? prevWeekLogs.reduce((sum, log) => sum + (log.angle || 90), 0) /
          prevWeekLogs.length
        : 90;

    res.json({
      currentScore: latestLog?.angle || 90,
      weeklyAverage: Math.round(weeklyAverage * 10) / 10,
      weeklyChange: Math.round((weeklyAverage - prevWeekAverage) * 10) / 10,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Error fetching dashboard stats" });
  }
});

// Get today's data
router.get("/dashboard/today", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await PostureLog.find({
      userId,
      timestamp: { $gte: today },
    }).sort({ timestamp: 1 });

    // Group by hour
    const hourlyData = {};
    logs.forEach((log) => {
      const hour = log.timestamp.getHours();
      const timeKey = `${hour.toString().padStart(2, "0")}:00`;

      if (!hourlyData[timeKey]) {
        hourlyData[timeKey] = { time: timeKey, good: 0, poor: 0, angles: [] };
      }

      if (log.postureType === "good") {
        hourlyData[timeKey].good += log.duration;
      } else {
        hourlyData[timeKey].poor += log.duration;
      }

      if (log.angle) hourlyData[timeKey].angles.push(log.angle);
    });

    const data = Object.values(hourlyData).map((h) => ({
      time: h.time,
      good: h.good,
      poor: h.poor,
      score:
        h.angles.length > 0
          ? Math.round(
              (h.angles.reduce((a, b) => a + b, 0) / h.angles.length) * 10
            ) / 10
          : 90,
    }));

    res.json({ data });
  } catch (error) {
    console.error("Today data error:", error);
    res.status(500).json({ error: "Error fetching today data" });
  }
});

// Get weekly data
router.get("/dashboard/week", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const logs = await PostureLog.find({
      userId,
      timestamp: { $gte: weekAgo },
    }).sort({ timestamp: 1 });

    // Group by day
    const dailyData = {};
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    logs.forEach((log) => {
      const dayName = days[log.timestamp.getDay()];

      if (!dailyData[dayName]) {
        dailyData[dayName] = { day: dayName, angles: [], sessions: 0 };
      }

      if (log.angle) dailyData[dayName].angles.push(log.angle);
      dailyData[dayName].sessions++;
    });

    const data = days.map((day) => ({
      day,
      score:
        dailyData[day]?.angles.length > 0
          ? Math.round(
              (dailyData[day].angles.reduce((a, b) => a + b, 0) /
                dailyData[day].angles.length) *
                10
            ) / 10
          : 0,
      sessions: dailyData[day]?.sessions || 0,
    }));

    res.json({ data });
  } catch (error) {
    console.error("Week data error:", error);
    res.status(500).json({ error: "Error fetching week data" });
  }
});

module.exports = router;
