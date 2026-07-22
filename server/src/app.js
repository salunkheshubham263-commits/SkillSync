const express = require("express");
const app = express();
const cors = require("cors");
const cookie = require("cookie-parser");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");

app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());
app.use(cookie());
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/uploads", express.static(path.join(__dirname,"uploads")));


app.get("/", (req, res) => {
    res.send("SkillSync backend running");
});

module.exports = app;