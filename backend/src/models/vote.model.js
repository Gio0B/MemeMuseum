const db = require('../db/database');

function findByUserAndMeme(userId, memeId, callback) {
    const sql = `
        SELECT type
        FROM votes
        WHERE user_id = ? AND meme_id = ?
    `;
    db.get(sql, [userId, memeId], callback);
}

function remove(userId, memeId, callback) {
    const sql = `
        DELETE FROM votes
        WHERE user_id = ? AND meme_id = ?
    `;
    db.run(sql, [userId, memeId], callback);
}

function upsert(userId, memeId, type, callback) {
    const sql = `
        INSERT INTO votes (user_id, meme_id, type)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id, meme_id)
        DO UPDATE SET type = excluded.type
    `;
    db.run(sql, [userId, memeId, type], callback);
}

module.exports = { findByUserAndMeme, remove, upsert };
