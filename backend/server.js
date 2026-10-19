require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(",").map((s) => s.trim()) || "http://localhost:5173",
  })
);
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err, req, res, next) => {
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid id format" });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(". ") });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "That value is already taken" });
  }
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error("Could not connect to MongoDB:", err.message);
    process.exit(1);
  });
