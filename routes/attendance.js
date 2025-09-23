const express = require("express");
const Attendance = require("../models/Attendance");

const router = express.Router();

// Mark Attendance
router.post("/mark", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  const today = new Date();
  const record = new Attendance({
    student_id: req.session.userId,
    date: today.toISOString().split("T")[0],
    time: today.toLocaleTimeString(),
    status: "Present"
  });

  await record.save();
  res.redirect("/dashboard");
});

// View Attendance
router.get("/records", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  const records = await Attendance.find({ student_id: req.session.userId });
  res.render("dashboard", { records });
});

module.exports = router;
