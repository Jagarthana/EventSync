const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "Please add an event title"],
    },
    type: {
      type: String,
      required: [true, "Please specify an event type"],
    },
    club: {
      type: String,
    },
    objectives: {
      type: String,
      required: [true, "Please add event objectives"],
    },
    description: {
      type: String,
      required: [true, "Please add an event description"],
    },
    date: {
      type: Date,
      required: [true, "Please add an event date"],
    },
    duration: {
      type: String,
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    participants: {
      type: Number,
      required: [true, "Please specify expected participants"],
    },
    venue: {
      type: String,
    },
    requirements: {
      type: String,
    },
    status: {
      type: String,
      enum: ["draft", "sub", "review", "approved", "rejected", "returned", "done"],
      default: "draft",
    },
    governanceApproval: {
      status: { type: String, enum: ["pending", "approved", "rejected", "returned"], default: "pending" },
      notes: String,
      updatedAt: Date,
    },
    financeApproval: {
      status: { type: String, enum: ["pending", "approved", "rejected", "returned"], default: "pending" },
      notes: String,
      updatedAt: Date,
    },
    venueApproval: {
      status: { type: String, enum: ["pending", "approved", "rejected", "returned"], default: "pending" },
      notes: String,
      updatedAt: Date,
    },
    allocatedBudget: {
      type: Number,
      default: 0,
    },
    totalEstimated: {
      type: Number,
      default: 0,
    },
    expenses: [
      {
        category: String,
        description: String,
        amount: Number,
      },
    ],
    // Keep documents flexible to avoid subdocument casting issues.
    documents: {
      type: Array,
      default: [],
    },
    resources: [String],
    report: {
      summary: String,
      totalParticipants: Number,
      studentParticipants: Number,
      facultyParticipants: Number,
      externalGuests: Number,
      achievements: String,
      actualExpenditure: Number,
      expenditureNotes: String,
      feedback: String,
      attachments: [
        {
          name: String,
          url: String,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);
