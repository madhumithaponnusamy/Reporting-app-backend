module.exports = function adminOnly(req, res, next) {
  try {
    // auth middleware already decoded token
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
