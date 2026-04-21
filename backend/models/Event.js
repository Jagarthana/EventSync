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
      required: function () {
        return this.status !== "draft";
      },
    },
    type: {
      type: String,
      required: function () {
        return this.status !== "draft";
      },
    },
    club: {
      type: String,
    },
    objectives: {
      type: String,
      required: function () {
        return this.status !== "draft";
      },
    },
    description: {
      type: String,
      required: function () {
        return this.status !== "draft";
      },
    },
    date: {
      type: Date,
      required: function () {
        return this.status !== "draft";
      },
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
      required: function () {
        return this.status !== "draft";
      },
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
        receiptUrl: String,
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        financeReason: String,
        decidedAt: Date,
      },
    ],
    // Store documents as plain array to avoid subdocument casting issues.
    // UI expects { name, type, url } items.
    documents: {
      type: Array,
      default: [],
    },
    /** Strings (legacy) or { name, quantity } objects from venue allocation */
    resources: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
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
    /** Finance officer sign-off on submitted final reports */
    reportFinanceReview: {
      status: {
        type: String,
        enum: ["pending", "signed_off", "revision_requested"],
        default: "pending",
      },
      notes: String,
      updatedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);
