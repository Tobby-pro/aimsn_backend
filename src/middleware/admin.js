const requireAdmin = (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!user.is_admin) {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
      return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { requireAdmin };