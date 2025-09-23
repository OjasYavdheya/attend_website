const express = require("express");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { name, roll_no, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const student = new Student({ name, roll_no, password: hashedPassword });
  await student.save();

  res.redirect("/login");
});

// Login
router.post("/login", async (req, res) => {
  const { roll_no, password } = req.body;
  const student = await Student.findOne({ roll_no });

  if (!student) return res.send("No user found");

  const match = await bcrypt.compare(password, student.password);
  if (!match) return res.send("Wrong password");

  req.session.userId = student._id;
  res.redirect("/dashboard");
});

module.exports = router;
