const mongoose = require("mongoose");

const helpChatLogSchema = new mongoose.Schema(
  {
    userMessage: { type: String, required: true, maxlength: 4000 },
    assistantReply: { type: String, required: true, maxlength: 8000 },
  },
  { timestamps: true }
);

helpChatLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("HelpChatLog", helpChatLogSchema);
