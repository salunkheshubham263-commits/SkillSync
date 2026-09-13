const express = require("express");
const app = express();
const cors = require("cors");
const cookie = require("cookie-parser");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const networkRoutes = require("./routes/networkRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

app.use(
  cors({
    origin: ["http://localhost:5173", "http://192.168.0.111:5173"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookie());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/network", networkRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("SkillSync backend running");
});

module.exports = app;
