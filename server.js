const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const attendanceRoutes = require("./routes/attendance");

const app = express();

// Connect DB
connectDB();

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

require("dotenv").config();

app.use(session({
  secret: process.env.SESSION_SECRET || "secret123",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));


// Routes
app.use("/", authRoutes);
app.use("/", attendanceRoutes);

// Pages
app.get("/", (req, res) => res.render("login"));
app.get("/login", (req, res) => res.render("login"));
app.get("/register", (req, res) => res.render("register"));
app.get("/dashboard", (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  res.render("dashboard", { records: [] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

