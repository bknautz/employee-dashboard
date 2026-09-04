const errorHandler = (err, req, res, next) => {
  if (err.name === "CastError") {
    return res.status(400).json({ error: err.invalidIdMessage || "Invalid ID" });
  }

  if (err.code === 11000) {
    return res.status(400).json({ error: err.duplicateMessage || "Duplicate resource" });
  }

  res.status(500).json({ error: err.message });
};

module.exports = errorHandler;
