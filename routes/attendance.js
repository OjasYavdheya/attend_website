const express = require("express");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const cron = require("node-cron");

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

    return res.send(message);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error marking attendance");
  }
});

// =========================
// AUTO-MARK ABSENTEES
// =========================
// Runs every day at 10:01 AM
cron.schedule("1 10 * * *", async () => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const students = await Student.find({});

    for (let student of students) {
      const existing = await Attendance.findOne({
        studentId: student._id,
        date: { $gte: todayStart, $lte: todayEnd }
      });

      if (!existing) {
        await Attendance.create({
          studentId: student._id,
          date: new Date(),
          status: "Absent"
        });
      }
    }

    console.log("✅ All unmarked students have been auto-marked Absent.");
  } catch (err) {
    console.error("❌ Error in auto-marking absentees:", err);
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
