const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../db/db");

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";


// ================= LOGIN (ADMIN / USER) =================
async function login(req, res) {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "Email, password and role are required" });
  }

  try {
    let sql;
    let idField;
    let nameField;
    let passwordField;

    if (role === "admin") {
      sql = `
        SELECT adminId, adminName, adminPassword, role
        FROM admin
        WHERE adminEmail = ?
      `;
      idField = "adminId";
      nameField = "adminName";
      passwordField = "adminPassword";

    } else if (role === "user") {
      sql = `
        SELECT userId, userName, userPassword
        FROM users
        WHERE userEmail = ?
      `;
      idField = "userId";
      nameField = "userName";
      passwordField = "userPassword";

    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    const [rows] = await db.execute(sql, [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user[passwordField]);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    const token = jwt.sign(
      {
        id: user[idField],
        role: role
      },
      JWT_SECRET,
      { expiresIn: "1h"}
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      role,
      name: user[nameField]
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}


async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }


    const [existing] = await db.execute(
      "SELECT userId FROM users WHERE userEmail = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      "INSERT INTO users (userName, userEmail, userPassword) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "Signup successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

async function adminSignup(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }


    const [existing] = await db.execute(
      "SELECT adminId FROM admin WHERE adminEmail = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      "INSERT INTO admin (adminName, adminEmail, adminPassword) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "Signup successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



// ================= ROUTES =================
function setupRoutes(app) {
  app.post("/api/auth/login", login);

  app.post("/api/auth/signup", signup)

  app.post("/api/auth/adminSignup", adminSignup)
}

module.exports = {
  login,
  setupRoutes
};
