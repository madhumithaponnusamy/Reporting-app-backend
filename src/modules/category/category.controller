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

async function postCategories(req,res) {
  try{
     const { categoryName } = req.body; 
     
    const[rows] = await db.execute(
      "INSERT INTO categories (categoryName) VALUES (?)",
      [categoryName]
    )

      res.status(201).json({
      message: "Category added successfully",
      categoryId: rows.insertId
    });
  } catch (err) {
    console.error("Insert categories error:", err);
    res.status(500).json({ message: "Failed to Insert category" });
  }
  
}

async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { categoryName } = req.body;

    if (!categoryName) {
      return res.status(400).json({ message: "Category name required" });
    }

    const [result] = await db.execute(
      "UPDATE categories SET categoryName = ? WHERE categoryId = ?",
      [categoryName, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
}

async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      "UPDATE categories SET deletedAt = NOW() WHERE categoryId = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
}


function setupRoutes(app) {

  app.get("/api/user/categories", getCategories);

  app.post("/api/admin/categories", postCategories)

  app.put("/api/admin/categories/:id",  updateCategory);

  app.delete("/api/admin/categories/:id", deleteCategory);
}

module.exports = { setupRoutes };
