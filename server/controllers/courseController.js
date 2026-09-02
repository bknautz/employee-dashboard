const Course = require('../models/Course');


// GET /api/courses
exports.getAllCourses = async (req, res) => {
     try {
       const results = await Course.find();
       res.status(201).json({
      message: 'User created',
      results
    });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
};

// POST /api/courses
exports.createCourse = async (req, res) => {

};
