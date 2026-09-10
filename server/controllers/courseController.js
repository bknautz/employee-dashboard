const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const LearningPath = require("../models/LearningPath");

// GET /api/courses
exports.getAllCourses = async (req, res, next) => {
  try {
    const results = await Course.find();
    res.status(200).json({
      message: "Courses Retrieved",
      results,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/courses
exports.createCourse = async (req, res, next) => {
  try {
    const { title, provider, description, hours, expirationMonths } = req.body;

    const existingCourse = await Course.findOne({ title });
    if (existingCourse) {
      return res.status(400).json({ error: "Course already exists" });
    }

    const course = new Course({
      title,
      provider,
      description,
      hours,
      expirationMonths,
    });

    await course.save();

    res.status(201).json({
      message: "Course created",

      course: {
        id: course._id,
        title: course.title,
        provider: course.provider,
        description: course.description,
        hours: course.hours,
        expirationMonths: course.expirationMonths,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/courses/:id
exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course Not Found" });
    }
    res.status(200).json({
      message: "Course Retrieved",
      course,
    });
  } catch (err) {
    err.invalidIdMessage = "Invalid Course ID";
    next(err);
  }
};

// PUT /api/courses/:id
exports.updateCourse = async (req, res, next) => {
  try {
    const { title, provider, description, hours, expirationMonths } = req.body;

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { title, provider, description, hours, expirationMonths },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json({
      message: "Courses Updated",
      course,
    });
  } catch (err) {
    err.invalidIdMessage = "Invalid Course ID";
    next(err);
  }
};

// DELETE /api/courses/:id
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course Not Found" });
    }

    const enrollmentCount = await Enrollment.countDocuments({ course: course._id });
    if (enrollmentCount > 0) {
      return res.status(400).json({
        error: `Cannot delete: ${enrollmentCount} employee(s) are enrolled in this course`,
      });
    }

    const pathCount = await LearningPath.countDocuments({ courses: course._id });
    if (pathCount > 0) {
      return res.status(400).json({
        error: `Cannot delete: this course is part of ${pathCount} learning path(s)`,
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Course Deleted",
    });
  } catch (err) {
    err.invalidIdMessage = "Invalid Course ID";
    next(err);
  }
};
