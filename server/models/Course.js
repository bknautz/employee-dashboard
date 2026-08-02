const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    provider: { type: String, required: true }, // e.g. "AWS", "Coursera"
    description: { type: String },
    hours: { type: Number, required: true },
    expirationMonths: { type: Number, default: null }, // e.g. cert expires 12 months after completion
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);