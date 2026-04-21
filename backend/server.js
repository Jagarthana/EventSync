const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { analyzeProposal } = require("./controllers/smartFeasibilityController");
const { protect } = require("./middlewares/authMiddleware");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", require("./routes/authRoutes"));
// Explicit route so POST /api/events/smart-feasibility always resolves (avoids 404 from router ordering).
app.post("/api/events/smart-feasibility", protect, analyzeProposal);
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/gov", require("./routes/govRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/finance", require("./routes/financeRoutes"));
app.use("/api/venue", require("./routes/venueRoutes"));
app.use("/api/catalog", require("./routes/catalogRoutes"));
app.use("/api", require("./routes/legacyCatalogRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/help", require("./routes/helpRoutes"));

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    console.error(
      "Fix: set MONGO_URI in backend/.env and ensure MongoDB is running, then restart the server."
    );
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
  });
}

start();
