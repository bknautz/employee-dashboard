const Team = require("../models/Team");
const User = require("../models/User");

const MANAGER_PROJECTION = "name email role";

// GET /api/teams
exports.getAllTeams = async (req, res, next) => {
  try {
    const results = await Team.find().populate("manager", MANAGER_PROJECTION);
    res.status(200).json({
      message: "Teams Retrieved",
      results,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/teams
exports.createTeam = async (req, res, next) => {
  try {
    const { name, manager } = req.body;

    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(400).json({ error: "Team already exists" });
    }

    const managerUser = await User.findById(manager);
    if (!managerUser) {
      return res.status(400).json({ error: "Manager not found" });
    }
    if (managerUser.role !== "manager") {
      return res.status(400).json({ error: "Assigned user is not a manager" });
    }

    const team = new Team({ name, manager });
    await team.save();

    res.status(201).json({
      message: "Team created",
      team: {
        id: team._id,
        name: team.name,
        manager: team.manager,
      },
    });
  } catch (err) {
    err.invalidIdMessage = "Invalid Manager ID";
    next(err);
  }
};

// GET /api/teams/:id
exports.getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id).populate("manager", MANAGER_PROJECTION);
    if (!team) {
      return res.status(404).json({ error: "Team Not Found" });
    }
    res.status(200).json({
      message: "Team Retrieved",
      team,
    });
  } catch (err) {
    err.invalidIdMessage = "Invalid Team ID";
    next(err);
  }
};

// PUT /api/teams/:id
exports.updateTeam = async (req, res, next) => {
  try {
    const { name, manager } = req.body;

    if (manager) {
      const managerUser = await User.findById(manager);
      if (!managerUser) {
        return res.status(400).json({ error: "Manager not found" });
      }
      if (managerUser.role !== "manager") {
        return res.status(400).json({ error: "Assigned user is not a manager" });
      }
    }

    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { name, manager },
      { new: true }
    ).populate("manager", MANAGER_PROJECTION);

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.status(200).json({
      message: "Team Updated",
      team,
    });
  } catch (err) {
    err.invalidIdMessage = "Invalid Team ID";
    next(err);
  }
};

// DELETE /api/teams/:id
exports.deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) {
      return res.status(404).json({ error: "Team Not Found" });
    }
    res.status(200).json({
      message: "Team Deleted",
    });
  } catch (err) {
    err.invalidIdMessage = "Invalid Team ID";
    next(err);
  }
};
