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
      typeof title !== 'string' ||
      typeof provider !== 'string' ||
      typeof hours !== 'number' ||
      !Number.isInteger(hours) ||
      (description !== undefined && typeof description !== 'string') ||
      (expirationMonths !== undefined && expirationMonths !== null && typeof expirationMonths !== 'number')
    ) {
      return res.status(400).json({ error: 'Invalid Course Input' });
    }

    const existingCourse = await Course.findOne({ title });
    if (existingCourse) {
      return res.status(400).json({ error: 'Course already exists' });
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
      message: 'Course created',
      
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
