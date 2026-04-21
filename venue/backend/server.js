const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { analyzeProposal } = require("./controllers/smartFeasibilityController");
const { protect } = require("./middlewares/authMiddleware");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", require("./routes/authRoutes"));
app.post("/api/events/smart-feasibility", protect, analyzeProposal);
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/gov", require("./routes/govRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/help", require("./routes/helpRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});