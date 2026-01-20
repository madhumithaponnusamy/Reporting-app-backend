const express = require("express");
const db = require("../../db/db");

async function getDistricts(req, res) {
  try {

    const [rows] = await db.execute(
      "SELECT districtId, districtName FROM district ORDER BY districtName"
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch districts" });
  }
}

async function getAreas(req, res) {
  try {
    const { districtId } = req.query;
    if (!districtId) return res.status(400).json({ message: "districtId required" });

    const [rows] = await db.execute(
      "SELECT areaId, areaName FROM area WHERE districtId = ? ORDER BY areaName",
      [districtId]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch areas" });
  }
}

function setupRoutes(app) {
  app.get("/api/user/districts", getDistricts);
  app.get("/api/user/areas", getAreas);
}

module.exports = { setupRoutes };
