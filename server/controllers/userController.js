const User = require("../models/User");
const Team = require("../models/Team");

// GET /api/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const results = await User.find().select("-password").populate("team", "name");
    res.status(200).json({
      message: "Users Retrieved",
      results,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { role, team } = req.body;

    if (team !== undefined && team !== null) {
      const existingTeam = await Team.findById(team);
      if (!existingTeam) {
        return res.status(400).json({ error: "Team not found" });
      }
    }

    const update = {};
    if (role !== undefined) update.role = role;
    if (team !== undefined) update.team = team;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true })
      .select("-password")
      .populate("team", "name");

    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }

    res.status(200).json({
      message: "User Updated",
      user,
    });
  } catch (err) {
    err.invalidIdMessage = "Invalid User ID";
    next(err);
  }
};
