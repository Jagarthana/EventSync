const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_123");

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

const finAuth = (req, res, next) => {
  if (req.user && (req.user.role === "Finance" || req.user.role === "Admin")) {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as Finance" });
  }
};

const venueAuth = (req, res, next) => {
  if (req.user && (req.user.role === "Venue" || req.user.role === "Admin")) {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as Venue Officer" });
  }
};

const govAuth = (req, res, next) => {
  if (req.user && (req.user.role === "Governance" || req.user.role === "Admin")) {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as Governance" });
  }
};

module.exports = { protect, govAuth, finAuth, venueAuth };
