const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, default: "Present" }
});

module.exports = mongoose.model("Attendance", attendanceSchema);
