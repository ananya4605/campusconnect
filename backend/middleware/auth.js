const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not logged in" });
  }

  try {
    const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Account no longer exists" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Session expired, please log in again" });
  }
}

module.exports = { protect };
