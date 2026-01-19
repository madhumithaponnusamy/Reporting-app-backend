const db = require("../../db/db");
const adminOnly = require("../middleware/adminonly");



/* ================= DASHBOARD STATS ================= */
async function dashboardStats(req, res) {
  try {

    const [[total]] = await db.execute(
      "SELECT COUNT(*) AS total FROM issues"
    );

    const [[pending]] = await db.execute(
      "SELECT COUNT(*) AS pending FROM issues WHERE status='pending'"
    );

    const [[inProgress]] = await db.execute(
      "SELECT COUNT(*) AS inProgress FROM issues WHERE status='inProgress'"
    );

    const [[resolved]] = await db.execute(
      "SELECT COUNT(*) AS resolved FROM issues WHERE status='resolved'"
    );

    res.json({
      total: total.total,
      pending: pending.pending,
      inProgress: inProgress.inProgress,
      resolved: resolved.resolved,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Dashboard load failed" });
  }
}


/* ================= USER LIST ================= */
async function listUsers(req, res) {
  try {

    const [rows] = await db.execute(
      "SELECT userId, userName, userEmail, phoneNumber FROM users"
    );
    res.json(rows);
  } catch (err) {
    console.error("List users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
}


/* ================= ALL USER ISSUES ================= */
async function listAllIssues(req, res) {
  try {


    const [rows] = await db.execute(`
      SELECT 
        i.issueId,
        i.problemDescription,
        i.status,
        u.userName,
        u.userEmail,
        a.areaName AS area
      FROM issues i
      JOIN users u ON i.userId = u.userId
      JOIN area a ON i.areaId = a.areaId
      ORDER BY i.issueId DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("List issues error:", err);
    res.status(500).json({ message: "Failed to fetch issues" });
  }
}

async function updateIssueStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ["pending", "in_progress", "resolved"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  await db.execute(
    "UPDATE issues SET status = ? WHERE issueId = ?",
    [status, id]
  );

  res.json({ message: "Status updated" });
}




function setupRoutes(app) {
  const auth = require("../middleware/auth.middleware");

  app.get("/api/admin/dashboard", auth, dashboardStats);
  app.get("/api/admin/users", auth, listUsers);

  app.get("/api/admin/issues", auth, listAllIssues);

  app.put("/api/admin/issues/:id/status", auth, adminOnly, updateIssueStatus);

}

module.exports = { setupRoutes };
