const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

const canModify = (req, enrollment) =>
  enrollment.user.toString() === req.user.userId || ["admin", "manager"].includes(req.user.role);

// POST /api/enrollments
exports.enroll = async (req, res) => {
  try {
    const { course } = req.body;

    const existingCourse = await Course.findById(course);
    if (!existingCourse) {
      return res.status(400).json({ error: "Course not found" });
    }

    const enrollment = new Enrollment({ user: req.user.userId, course });
    await enrollment.save();

    res.status(201).json({
      message: "Enrolled in course",
      enrollment: {
        id: enrollment._id,
        user: enrollment.user,
        course: enrollment.course,
        status: enrollment.status,
        progressPercent: enrollment.progressPercent,
      },
    });
  } catch (err) {
    if (err.name === "CastError") {
      res.status(400).json({ error: "Invalid Course ID" });
    } else if (err.code === 11000) {
      res.status(400).json({ error: "Already enrolled in this course" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

// GET /api/enrollments/me
exports.getMyEnrollments = async (req, res) => {
  try {
    const results = await Enrollment.find({ user: req.user.userId }).populate("course");
    res.status(200).json({
      message: "Enrollments Retrieved",
      results,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/enrollments/:id/progress
exports.updateProgress = async (req, res) => {
  try {
    const { progressPercent } = req.body;

    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment Not Found" });
    }

    if (!canModify(req, enrollment)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    if (enrollment.status === "completed") {
      return res.status(400).json({ error: "Enrollment already completed" });
    }

    enrollment.progressPercent = progressPercent;
    enrollment.status = progressPercent > 0 ? "in_progress" : "not_started";
    await enrollment.save();

    res.status(200).json({
      message: "Progress Updated",
      enrollment,
    });
  } catch (err) {
    if (err.name === "CastError") {
      res.status(400).json({ error: "Invalid Enrollment ID" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

// POST /api/enrollments/:id/complete
exports.markComplete = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment Not Found" });
    }

    if (!canModify(req, enrollment)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    if (enrollment.status === "completed") {
      return res.status(400).json({ error: "Enrollment already completed" });
    }

    enrollment.status = "completed";
    enrollment.progressPercent = 100;
    enrollment.completedAt = new Date();
    await enrollment.save();

    res.status(200).json({
      message: "Enrollment Marked Complete",
      enrollment,
    });
  } catch (err) {
    if (err.name === "CastError") {
      res.status(400).json({ error: "Invalid Enrollment ID" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};
