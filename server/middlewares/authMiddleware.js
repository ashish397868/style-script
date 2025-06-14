// authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userid) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await User.findById(decoded.userid).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();

  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Requires admin role" });
  }
  next();
};

module.exports = { authenticateUser, isAdmin };
