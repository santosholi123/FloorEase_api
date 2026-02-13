const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    cityAddress: {
      type: String,
      required: true,
      trim: true,
    },
    serviceType: {
      type: String,
      enum: ["Installation", "Repair", "Polish", "Inspection"],
      default: "Installation",
      required: true,
    },
    flooringType: {
      type: String,
      enum: ["Homogeneous", "Heterogeneous", "SPC", "Vinyl", "Carpet", "Wooden"],
      default: "Homogeneous",
      required: true,
    },
    areaSize: {
      type: Number,
      required: true,
      min: 1,
    },
    preferredDate: {
      type: String,
      required: true,
    },
    preferredTime: {
      type: String,
      enum: ["Morning 8-12", "Afternoon 12-4", "Evening 4-8"],
      default: "Morning 8-12",
      required: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);
