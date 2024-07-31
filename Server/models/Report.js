const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reportType: { type: String, enum: ["lost", "found"], required: true },
  location: { type: String, required: true },
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  images: { type: [String], required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  claimedBy: { type: String },
  read: { type: Boolean, default: false },
  responseMessage: { type: String }, // New field for response message
});

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
