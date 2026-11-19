const db = require('../db/database');

function create(text, userId, memeId, callback) {
    const sql = `INSERT INTO comments (text, user_id, meme_id) VALUES (?, ?, ?)`;
    db.run(sql, [text, userId, memeId], callback);
}

function findByMemeId(memeId, callback) {
    const sql = `
        SELECT c.*, u.username 
        FROM comments c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.meme_id = ? 
        ORDER BY c.created_at DESC
    `;
    db.all(sql, [memeId], callback);
}

function findById(commentId, callback) {
    db.get(`SELECT * FROM comments WHERE id = ?`, [commentId], callback);
}

function remove(commentId, callback) {
    db.run(`DELETE FROM comments WHERE id = ?`, [commentId], callback);
}

module.exports = { create, findByMemeId, findById, remove };
