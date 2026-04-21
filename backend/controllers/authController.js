const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { isValidSliitStudentEmail, STUDENT_EMAIL_HINT } = require("../utils/sliitStudentEmail");

const OFFICIAL_EMAIL_ROLE_MAP = {
  "fin@gmail.com": "Finance",
  "ven@gmail.com": "Venue",
  "stdservices@gmail.com": "Governance",
  "sdcreserves@gmail.com": "Governance",
};

const OFFICIAL_LOGIN_EMAILS = new Set(Object.keys(OFFICIAL_EMAIL_ROLE_MAP).map((k) => k.toLowerCase()));

const MSG_OFFICIAL_PORTAL_EMAIL =
  "Only designated officer accounts can sign in here. Use the email issued to you by the administrator.";
const MSG_STUDENT_PORTAL_OFFICIAL =
  "Official accounts cannot use the student sign-in. Use your Governance, Finance, or Venue departmental portal with your issued officer email.";
const MSG_LOGIN_EMAIL_SHAPE =
  "Sign in with your SLIIT student email (IT or BM plus 8 characters @my.sliit.lk) or your authorized official officer email.";

const getNormalizedRoles = (user, email) => {
  const roleByEmail = OFFICIAL_EMAIL_ROLE_MAP[(email || "").toLowerCase()];
  const roles = Array.isArray(user?.roles)
    ? [...user.roles]
    : user?.role
      ? [user.role]
      : ["Organizer"];
  if (roleByEmail && !roles.includes(roleByEmail)) roles.push(roleByEmail);
  return [...new Set(roles)];
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret_123", {
    expiresIn: "30d",
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

/** Case-insensitive exact email match without MongoDB collation (avoids 500s on older DBs / Atlas quirks). */
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const findUserByEmail = (emailNorm) => {
  if (!emailNorm) return Promise.resolve(null);
  return User.findOne({ email: new RegExp(`^${escapeRegex(emailNorm)}$`, "i") });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please add all fields" });
    }

    const emailNorm = normalizeEmail(email);
    if (!emailNorm) {
      return res.status(400).json({ message: "Please add a valid email" });
    }

    if (!isValidSliitStudentEmail(emailNorm)) {
      return res.status(400).json({ message: STUDENT_EMAIL_HINT });
    }

    if (OFFICIAL_LOGIN_EMAILS.has(emailNorm)) {
      return res.status(400).json({
        message: "Official accounts cannot be registered here. They are created by the system administrator.",
      });
    }

    const userExists = await findUserByEmail(emailNorm);

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Public registration: student organizers only (ignore elevated roles from client)
    const user = await User.create({
      name: name.trim(),
      email: emailNorm,
      password: hashedPassword,
      roles: ["Organizer"],
    });

    if (user) {
      const roles = getNormalizedRoles(user, user.email);
      user.roles = roles;
      await user.save();
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        roles,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password, portal: portalRaw, loginPortal } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please add email and password" });
    }

    const emailNorm = normalizeEmail(email);
    const portal = String(portalRaw || loginPortal || "")
      .trim()
      .toLowerCase();

    const isOfficialEmail = OFFICIAL_LOGIN_EMAILS.has(emailNorm);
    const isStudentEmail = isValidSliitStudentEmail(emailNorm);

    if (portal === "student") {
      if (!isStudentEmail) {
        return res.status(400).json({ message: STUDENT_EMAIL_HINT });
      }
      if (isOfficialEmail) {
        return res.status(400).json({ message: MSG_STUDENT_PORTAL_OFFICIAL });
      }
    } else if (portal === "official") {
      if (!isOfficialEmail) {
        return res.status(400).json({ message: MSG_OFFICIAL_PORTAL_EMAIL });
      }
    } else if (!isStudentEmail && !isOfficialEmail) {
      return res.status(400).json({ message: MSG_LOGIN_EMAIL_SHAPE });
    }

    const user = await findUserByEmail(emailNorm);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const roles = getNormalizedRoles(user, user.email);

    const mustBeOfficial =
      portal === "official" || (portal === "" && isOfficialEmail);
    const mustBeStudent =
      portal === "student" || (portal === "" && isStudentEmail);

    if (mustBeOfficial) {
      const allowed = roles.some((r) =>
        ["Governance", "Finance", "Venue", "Admin"].includes(r)
      );
      if (!allowed) {
        return res.status(403).json({
          message: "This account is not authorized for official portal access.",
        });
      }
    }

    if (mustBeStudent) {
      if (!roles.includes("Organizer") && !roles.includes("Admin")) {
        return res.status(403).json({
          message:
            "This student email is not registered as an organizer. Create an account on the student registration page first.",
        });
      }
    }

    user.roles = roles;
    await user.save();
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      roles,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const roles = getNormalizedRoles(req.user, req.user?.email);
    res.status(200).json({ ...req.user.toObject(), roles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
