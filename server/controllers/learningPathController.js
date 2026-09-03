const LearningPath = require("../models/LearningPath");
const Course = require("../models/Course");

// GET /api/learning-paths
exports.getAllLearningPaths = async (req, res) => {
  try {
    const results = await LearningPath.find().populate("courses");
    res.status(200).json({
      message: "Learning Paths Retrieved",
      results,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/learning-paths
exports.createLearningPath = async (req, res) => {
  try {
    const { title, description, courses } = req.body;

    const existingPath = await LearningPath.findOne({ title });
    if (existingPath) {
      return res.status(400).json({ error: "Learning path already exists" });
    }

    if (courses && courses.length > 0) {
      const matchingCourses = await Course.find({ _id: { $in: courses } });
      if (matchingCourses.length !== courses.length) {
        return res.status(400).json({ error: "One or more course ids do not exist" });
      }
    }

    const learningPath = new LearningPath({ title, description, courses });
    await learningPath.save();

    res.status(201).json({
      message: "Learning path created",
      learningPath: {
        id: learningPath._id,
        title: learningPath.title,
        description: learningPath.description,
        courses: learningPath.courses,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/learning-paths/:id
exports.getLearningPathById = async (req, res) => {
  try {
    const learningPath = await LearningPath.findById(req.params.id).populate("courses");
    if (!learningPath) {
      return res.status(404).json({ error: "Learning Path Not Found" });
    }
    res.status(200).json({
      message: "Learning Path Retrieved",
      learningPath,
    });
  } catch (err) {
    if (err.name === "CastError") {
      res.status(400).json({ error: "Invalid Learning Path ID" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

// PUT /api/learning-paths/:id
exports.updateLearningPath = async (req, res) => {
  try {
    const { title, description, courses } = req.body;

    if (courses && courses.length > 0) {
      const matchingCourses = await Course.find({ _id: { $in: courses } });
      if (matchingCourses.length !== courses.length) {
        return res.status(400).json({ error: "One or more course ids do not exist" });
      }
    }

    const learningPath = await LearningPath.findByIdAndUpdate(
      req.params.id,
      { title, description, courses },
      { new: true }
    ).populate("courses");

    if (!learningPath) {
      return res.status(404).json({ error: "Learning Path not found" });
    }

    res.status(200).json({
      message: "Learning Path Updated",
      learningPath,
    });
  } catch (err) {
    if (err.name === "CastError") {
      res.status(400).json({ error: "Invalid Learning Path ID" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

// DELETE /api/learning-paths/:id
exports.deleteLearningPath = async (req, res) => {
  try {
    const learningPath = await LearningPath.findByIdAndDelete(req.params.id);
    if (!learningPath) {
      return res.status(404).json({ error: "Learning Path Not Found" });
    }
    res.status(200).json({
      message: "Learning Path Deleted",
    });
  } catch (err) {
    if (err.name === "CastError") {
      res.status(400).json({ error: "Invalid Learning Path ID" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};
