const express = require("express");
const db = require("../../db/db");


// GET all categories
async function getCategories(req, res) {
  try {

    const [rows] = await db.execute(
      "SELECT categoryId, categoryName FROM categories ORDER BY categoryName"
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("Fetch categories error:", err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
}

function setupRoutes(app) {

  app.get("/api/user/categories", getCategories);
}

module.exports = { setupRoutes };
