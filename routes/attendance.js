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
// AUTO-MARK ABSENTEES FUNCTION
// =========================
async function autoMarkAbsentees() {
  try {
    console.log("🔄 Running auto-mark absentees job...");
    
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // Get all students
    const students = await Student.find({});
    console.log(`📊 Total students: ${students.length}`);

    let markedCount = 0;

    for (let student of students) {
      // Check if student has any attendance record for today
      const existing = await Attendance.findOne({
        studentId: student._id,
        date: { $gte: todayStart, $lte: todayEnd }
      });

      // If no record exists, mark as absent
      if (!existing) {
        await Attendance.create({
          studentId: student._id,
          date: new Date(),
          status: "Absent"
        });
        markedCount++;
      }
    }

    console.log(`✅ Auto-marked ${markedCount} students as Absent.`);
  } catch (err) {
    console.error("❌ Error in auto-marking absentees:", err);
  }
}

// =========================
// SCHEDULE CRON JOB
// =========================
// Runs every day at 10:05 AM (5 minutes after cutoff)
// Format: second minute hour day month weekday
cron.schedule("5 10 * * *", autoMarkAbsentees, {
  timezone: "Asia/Kolkata" // Set your timezone
});

console.log("⏰ Cron job scheduled: Auto-mark absentees at 10:05 AM daily");

// =========================
// MARK ATTENDANCE (Manual)
// =========================
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
      // After cutoff - mark as absent (late arrival not allowed)
      status = "Absent";
      message = "Sorry! Attendance window closed at 10:00 AM. You are marked absent.";
    } else {
      // Before cutoff - mark as present
      status = "Present";
      message = "Attendance marked successfully!";
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
// VIEW ATTENDANCE
// =========================
router.get("/records", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  const records = await Attendance.find({ studentId: req.session.userId })
    .sort({ date: -1 });

  res.render("dashboard", { records });
});

// =========================
// MANUAL TRIGGER (for testing)
// =========================
router.post("/admin/trigger-auto-mark", async (req, res) => {
  // Add authentication check for admin here
  await autoMarkAbsentees();
  res.send("Auto-mark job triggered manually");
});

module.exports = router;
