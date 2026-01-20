module.exports = {
  ADMINLOGIN: `
    SELECT adminId, adminName, adminEmail, adminPassword, role
    FROM admin
    WHERE adminEmail = ?
  `,

  USERLOGIN: `
    SELECT userId, userName, userEmail, userPassword
    FROM users
    WHERE userEmail = ?
  `
};
