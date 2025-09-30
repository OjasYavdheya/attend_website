const express = require("express");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

const router = express.Router();

// Mark Attendance
router.post("/mark", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  try {
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if already marked today
    const existing = await Attendance.findOne({
      studentId: req.session.userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existing) {
      return res.status(400).send("Attendance already marked today");
    }

    // Cutoff time = 10:00 AM
    const cutoff = new Date(now);
    cutoff.setHours(10, 0, 0, 0);

    let status;
    let message;

    if (now > cutoff) {
      status = "Absent";
      message = "You are late and have been marked absent.";
    } else {
      status = "Present";
      message = "Attendance marked successfully.";
    }

    const record = new Attendance({
      studentId: req.session.userId,
      date: now,
      status
    });

    await record.save();

    // Option 1: Show message directly
    return res.send(message);

    // Option 2 (if you want to redirect and flash message):
    // req.session.message = message;
    // return res.redirect("/dashboard");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error marking attendance");
  }
});

// View Attendance
router.get("/records", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  const records = await Attendance.find({ studentId: req.session.userId })
    .sort({ date: -1 });

  res.render("dashboard", { records });
});

module.exports = router;
