const express = require("express");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

const router = express.Router();

// Mark Attendance
router.post("/mark", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Check if already marked today
    const existing = await Attendance.findOne({
      studentId: req.session.userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existing) {
      return res.status(400).send("Attendance already marked today");
    }

    // Save new attendance
    const record = new Attendance({
      studentId: req.session.userId,
      status: "Present"
    });

    await record.save();
    res.redirect("/dashboard");
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
