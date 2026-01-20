const crypto = require("crypto");
const db = require("../../db/db");

async function httpLogger(req, res, next) {
  const start = Date.now();
  const traceId = crypto.randomBytes(8).toString("hex");

  res.on("finish", async () => {
    const responseTime = Date.now() - start + "ms";

    try {
      await db.execute(
        `INSERT INTO log (traceId, type, title, details)
         VALUES (?, ?, ?, ?)`,
        [
          traceId,
          "request",
          "HTTP Request",
          JSON.stringify({
            url: req.originalUrl,
            method: req.method,
            status: res.statusCode,
            responseTime
          })
        ]
      );
    } catch (err) {
      console.error("HTTP log error:", err.message);
    }
  });

  next();
}

module.exports = httpLogger;
