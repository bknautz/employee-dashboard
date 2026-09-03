const Course = require("../models/Course");

// GET /api/courses
exports.getAllCourses = async (req, res) => {
  try {
    const results = await Course.find();
    res.status(200).json({
      message: "Courses Retrieved",
      results,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/courses
exports.createCourse = async (req, res) => {
  try {
    const { title, provider, description, hours, expirationMonths } = req.body;

    if (
      typeof title !== "string" ||
      typeof provider !== "string" ||
      typeof hours !== "number" ||
      !Number.isInteger(hours) ||
      (description !== undefined && typeof description !== "string") ||
      (expirationMonths !== undefined &&
        expirationMonths !== null &&
        typeof expirationMonths !== "number")
    ) {
      return res.status(400).json({ error: "Invalid Course Input" });
    }

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
    res.status(500).json({ error: err.message });
  }
};

// GET /api/courses/:id
exports.getCourseById = async (req, res) => {
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
    if (err.name === "CastError") {
      res.status(400).json({ error: "Invalid Course ID" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

// PUT /api/courses/:id
exports.updateCourse = async (req, res) => {
  try {
    const { title, provider, description, hours, expirationMonths } = req.body;

    if (
      typeof title !== "string" ||
      typeof provider !== "string" ||
      typeof hours !== "number" ||
      !Number.isInteger(hours) ||
      (description !== undefined && typeof description !== "string") ||
      (expirationMonths !== undefined &&
        expirationMonths !== null &&
        typeof expirationMonths !== "number")
    ) {
      return res.status(400).json({ error: "Invalid Course Input" });
    }
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
   if (err.name === "CastError") {
      res.status(400).json({ error: "Invalid Course ID" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

// DELETE /api/courses/:id
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course Not Found" });
    }
    res.status(200).json({
      message: "Course Deleted",
    });
  } catch (err) {
    if (err.name === "CastError") {
      res.status(400).json({ error: "Invalid Course ID" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};
