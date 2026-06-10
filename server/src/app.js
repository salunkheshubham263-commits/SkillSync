const express = require("express");
const app = express();
const cors = require("cors");
const cookie = require("cookie-parser");

const authRoutes = require("./routes/authRoutes")

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(cookie());
app.use("/api/auth", authRoutes);


app.get("/", (req, res) => {
    res.send("SkillSync backend running");
});

module.exports = app;