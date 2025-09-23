const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roll_no: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model("Student", studentSchema);
