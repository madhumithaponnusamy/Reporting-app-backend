const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "reportingapp",
  });

  const name = "admin";           // your new admin name
  const email = "admin12@gmail.com"; // new admin email
  const password = "123456";          // new admin password
  const hashedPassword = await bcrypt.hash(password, 10);

  await connection.execute(
    "INSERT INTO admin (adminName, adminEmail, adminPassword) VALUES (?, ?, ?)",
    [name, email, hashedPassword]
  );

  console.log("New admin created successfully!");
  await connection.end();
}

createAdmin();
