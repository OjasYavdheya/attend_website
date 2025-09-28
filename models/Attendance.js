const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  date: { type: Date, default: Date.now }, // Proper Date type
  status: { type: String, enum: ["Present", "Absent"], required: true }
});

module.exports = mongoose.model("Attendance", attendanceSchema);
