const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { protect } = require("../middleware/auth");

const router = express.Router();
const EMAIL_RX = /^\S+@\S+\.\S+$/;

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });
}

function publicUser(user) {
  return { _id: user._id, name: user.name, email: user.email };
}

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (!EMAIL_RX.test(email.trim())) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(409).json({ message: "That email is already registered" });
    }

    const user = await User.create({ name: name.trim(), email, password });
    res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Wrong email or password" });
    }

    res.json({ token: signToken(user._id), user: publicUser(user) });
  })
);

router.get("/me", protect, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = router;
