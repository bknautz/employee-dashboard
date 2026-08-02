const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // e.g. "Cloud Engineer Transition"
    description: { type: String },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('LearningPath', learningPathSchema);