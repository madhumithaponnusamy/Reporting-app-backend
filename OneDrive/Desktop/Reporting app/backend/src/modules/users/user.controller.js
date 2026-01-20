const crypto = require("crypto");
const db = require("../../db/db");
const sendMail = require("../mail/mail");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

async function sendOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);


    await db.execute(
      "DELETE FROM otp WHERE email = ?",
      [email]
    );


    await db.execute(
      `INSERT INTO otp (email, otp, expiresAt)
       VALUES (?, ?, ?)`,
      [email, otp, expiresAt]
    );

    await sendMail(
      email,
      "Your OTP Code",
      `Your OTP is ${otp}. It expires in 5 minutes.`
    );

    res.status(200).json({ message: "OTP sent" });

  } catch (err) {
    console.error("OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email & OTP required" });
    }

    const [rows] = await db.execute(
      `SELECT * FROM otp
       WHERE email = ? 
       ORDER BY createdAt DESC
       LIMIT 1`,
      [email,]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "OTP not found" });
    }

    const record = rows[0];

    if (new Date(record.expiresAt) < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.attempts >= 3) {
      return res.status(400).json({ message: "Too many attempts" });
    }

    if (record.otp !== otp) {
      await db.execute(
        "UPDATE otp SET attempts = attempts + 1 WHERE otpId = ?",
        [record.otpId]
      );
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const [users] = await db.execute(
      "SELECT userId FROM users WHERE userEmail = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    const token = jwt.sign(
      { id: user.userId, role: "user" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );


    // mark used
    await db.execute(
      "UPDATE otp SET attempts = attempts + 1 WHERE otpId = ?",
      [record.otpId]
    );

    res.json({
      message: "OTP verified",
      token,
      role: "user"
    });


  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
}




function setupRoutes(app) {

  app.post("/api/otp", sendOtp)

  app.post("/api/otp/verify", verifyOtp);

}

module.exports = { setupRoutes };
