const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getUserRoles = (user) => {
  if (!user) return [];
  if (Array.isArray(user.roles)) return user.roles;
  if (typeof user.role === "string" && user.role) return [user.role];
  return [];
};

const hasAnyRole = (user, allowedRoles) => {
  const roles = getUserRoles(user);
  return allowedRoles.some((r) => roles.includes(r));
};

const optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_123");
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      // Ignore invalid token for optional auth routes
      req.user = null;
    }
  }
  next();
};

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_123");
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }
    req.user = user;
    return next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Not authorized" });
  }
};

const finAuth = (req, res, next) => {
  if (req.user && hasAnyRole(req.user, ["Finance", "Admin"])) {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as Finance" });
  }
};

const venueAuth = (req, res, next) => {
  if (req.user && hasAnyRole(req.user, ["Venue", "Admin"])) {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as Venue Officer" });
  }
};

/** Read-only schedule data for Master Calendar (venue officers + planners / transparency). */
const venueSnapshotReaderAuth = (req, res, next) => {
  if (
    req.user &&
    hasAnyRole(req.user, ["Venue", "Admin", "Organizer", "StudentServices", "Governance", "Finance"])
  ) {
    next();
  } else {
    res.status(401).json({ message: "Not authorized to view venue schedule" });
  }
};

const govAuth = (req, res, next) => {
  if (req.user && hasAnyRole(req.user, ["Governance", "Admin"])) {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as Governance" });
  }
};

const superAdminAuth = (req, res, next) => {
  if (req.user && hasAnyRole(req.user, ["Admin"])) {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as Admin" });
  }
};

module.exports = {
  protect,
  optionalProtect,
  govAuth,
  finAuth,
  venueAuth,
  venueSnapshotReaderAuth,
  superAdminAuth,
};
