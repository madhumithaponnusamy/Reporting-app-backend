const express = require("express");
const auth = require("../middleware/auth.middleware");
const upload = require("../middleware/upload");
const db = require("../../db/db")


async function reportingIssue(req, res) {
  try {

    const userId = req.user.id;

    let {
      categoryId,
      districtId,
      areaId,
      problemDescription,
      latitude,
      longitude,

    } = req.body;

    let image = req.file ? req.file.filename : null;

    // Convert to integers
    categoryId = parseInt(categoryId, 10);
    districtId = parseInt(districtId, 10);
    areaId = parseInt(areaId, 10);

    // Convert latitude/longitude to float (optional, but safer)
    latitude = latitude ? parseFloat(latitude) : null;
    longitude = longitude ? parseFloat(longitude) : null;

    if (!categoryId || !districtId || !areaId || !problemDescription) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const sql = `
      INSERT INTO issues
      (userId, categoryId, districtId, areaId, problemDescription, latitude, longitude, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      userId,
      categoryId,
      districtId,
      areaId,
      problemDescription,
      latitude,
      longitude,
      image,
    ]);


    res.status(201).json({
      message: "Issue created",
      issueId: result.insertId,
    });
  } catch (err) {
    console.error("❌ Create issue error:", err);
    res.status(500).json({ message: "DB insert failed" });
  }
};


async function getMyReports(req, res) {
  try {

    const userId = req.user.id;


    const sql = `
      SELECT 
        i.issueId,
        i.problemDescription,
        i.image,
        i.latitude,
        i.longitude,
        i.createdAt,
        i.status,
        c.categoryName,
        d.districtName,
        a.areaName
      FROM issues i
      JOIN categories  c ON i.categoryId = c.categoryId
      JOIN district d ON i.districtId = d.districtId
      JOIN area a ON i.areaId = a.areaId
      WHERE i.userId = ?
      ORDER BY i.createdAt DESC
    `;


    const [rows] = await db.execute(sql, [userId]);

    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ Fetch my reports error:", err);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
}


async function getSingleIssue(req, res) {
  try {
    const issueId = req.params.id;
    const userId = req.user.id;

    const [rows] = await db.execute(
      `SELECT 
        i.issueId,
        i.categoryId,
        i.districtId,
        i.areaId,
        i.problemDescription,
        i.latitude,
        i.longitude,
        i.status,
        i.image
       FROM issues i
       WHERE i.issueId = ? AND i.userId = ?`,
      [issueId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch issue" });
  }
}




async function updateIssue(req, res) {
  try {

    const issueId = req.params.id;
    const userId = req.user.id;

    const {
      categoryId,
      districtId,
      areaId,
      problemDescription,
      latitude,
      longitude
    } = req.body;

    const image = req.file ? req.file.filename : null;

    let sql = `
      UPDATE issues 
      SET categoryId=?, districtId=?, areaId=?, problemDescription=?, latitude=?, longitude=?
    `;
    let params = [
      categoryId,
      districtId,
      areaId,
      problemDescription,
      latitude,
      longitude,
    ];

    if (image) {
      sql += `, image=?`;
      params.push(image);
    }

    sql += ` WHERE issueId=? AND userId=?`;
    params.push(issueId, userId);

    const [result] = await db.execute(sql, params);

    res.json({ message: "Issue updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
}




async function deleteIssue(req, res) {
  try {

    const issueId = req.params.id;
    const userId = req.user.id; 


    const [result] = await db.execute(
      "UPDATE issues SET deletedAt = NOW() WHERE issueId = ? AND userId = ?",
      [issueId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Issue not found or not authorized" });
    }

    res.json({ message: "Issue deleted successfully" });
  } catch (err) {
    console.error("Delete issue error:", err);
    res.status(500).json({ message: "Failed to delete issue" });
  }
}






function setupRoutes(app) {
  app.post("/api/issue", auth, upload.single("image"), reportingIssue);

  app.get("/api/myreport", auth, getMyReports);

  app.get("/api/issues/:id", auth, getSingleIssue);


  app.put("/api/issues/:id", auth, upload.single("image"), updateIssue);


  app.delete("/api/issues/:id", auth, deleteIssue);



}



module.exports = { setupRoutes };
