module.exports = {
  ADMIN_BY_EMAIL: `
    SELECT adminId, adminName, adminEmail, adminPassword, role
    FROM admin
    WHERE adminEmail = ?
  `,

  USER_BY_EMAIL: `
    SELECT userId, userName, userEmail, userPassword
    FROM users
    WHERE userEmail = ?
  `,

  USER_REGISTER: `
    INSERT INTO users (userName, userEmail, userPassword, phoneNumber)
    VALUES (?, ?, ?, ?)
  `
};
