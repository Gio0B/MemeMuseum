const db = require('../db/database');

function create(username, email, hashedPassword, callback) {
    const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    db.run(sql, [username, email, hashedPassword], callback);
}

function findByEmail(email, callback) {
    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], callback);
}

module.exports = { create, findByEmail };
