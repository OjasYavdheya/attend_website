const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roll_no: { type: String, unique: true, required: true, match: [/^\d{1,6}$/, "Roll number must be only digits and max 6 characters"]},
  password: { type: String, required: true }
});

module.exports = mongoose.model("Student", studentSchema);
