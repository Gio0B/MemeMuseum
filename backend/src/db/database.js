const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('../config/config');

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
    // Tabella Utenti
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    // Tabella Meme
    db.run(`CREATE TABLE IF NOT EXISTS memes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        image_path TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Tabella Tag
    db.run(`CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    )`);

    // Tabella di collegamento Meme-Tag (Molti a Molti)
    db.run(`CREATE TABLE IF NOT EXISTS meme_tags (
        meme_id INTEGER,
        tag_id INTEGER,
        PRIMARY KEY (meme_id, tag_id),
        FOREIGN KEY(meme_id) REFERENCES memes(id) ON DELETE CASCADE,
        FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )`);

    // Tabella Commenti
    db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        meme_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(meme_id) REFERENCES memes(id) ON DELETE CASCADE
    )`);

    // Tabella Voti
    db.run(`CREATE TABLE IF NOT EXISTS votes (
        user_id INTEGER,
        meme_id INTEGER,
        type INTEGER NOT NULL, --1 per upvote, -1 per downvote
        PRIMARY KEY (user_id, meme_id),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(meme_id) REFERENCES memes(id) ON DELETE CASCADE
    )`);
});

console.log("Database e tabelle inizializzate con successo.");

module.exports = db;
