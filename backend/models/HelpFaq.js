const mongoose = require("mongoose");

const helpFaqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, unique: true },
    answer: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

helpFaqSchema.index({ order: 1 });

module.exports = mongoose.model("HelpFaq", helpFaqSchema);
