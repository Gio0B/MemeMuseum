const db = require('../db/database');

function create(title, imagePath, userId, callback) {
    const sql = `INSERT INTO memes (title, image_path, user_id) VALUES (?, ?, ?)`;
    db.run(sql, [title, imagePath, userId], callback);
}

// Inserisce il tag se non esiste ancora (grazie a INSERT OR IGNORE), poi
// recupera comunque il suo id (sia che sia appena stato creato o che
// esistesse già) e lo passa alla callback come "tag".
function findOrCreateTag(tagName, callback) {
    db.run(`INSERT OR IGNORE INTO tags (name) VALUES (?)`, [tagName], function () {
        db.get(`SELECT id FROM tags WHERE name = ?`, [tagName], callback);
    });
}

// Collega un meme a un tag nella tabella pivot meme_tags
function linkTag(memeId, tagId) {
    db.run(`INSERT OR IGNORE INTO meme_tags (meme_id, tag_id) VALUES (?, ?)`, [memeId, tagId]);
}

function findAll({ page, tag, sort }, callback) {
    const limit = 9;
    const offset = (page - 1) * limit;

    // Query di base: recupera i meme calcolando anche il punteggio (upvote - downvote)
    let sql = `
        SELECT m.*, u.username,
               COALESCE(SUM(CASE WHEN v.type = 1 THEN 1 ELSE 0 END), 0) - 
               COALESCE(SUM(CASE WHEN v.type = -1 THEN 1 ELSE 0 END), 0) AS score
        FROM memes m
        LEFT JOIN users u ON m.user_id = u.id
        LEFT JOIN votes v ON m.id = v.meme_id
    `;

    const params = [];

    // Se è stato richiesto un filtro per tag, aggiungo una JOIN con la tabella dei tag.
    // Il confronto è case-insensitive: i tag vengono salvati in minuscolo al momento
    // dell'upload (vedi meme.controller.uploadMeme), quindi confronto anche qui in
    // minuscolo per coerenza (bug corretto: nella versione originale la chiamata a
    // .toLowerCase() non veniva effettivamente applicata al valore cercato).
    if (tag) {
        sql += `
        JOIN meme_tags mt ON m.id = mt.meme_id
        JOIN tags t ON mt.tag_id = t.id
        WHERE t.name LIKE ?
    `;
        params.push(`%${tag.toLowerCase()}%`);
    }

    // Raggruppo per id del meme (necessario per il calcolo dei voti con SUM)
    sql += ` GROUP BY m.id `;

    // Gestisco l'ordinamento richiesto
    if (sort === 'date_asc') {
        sql += ` ORDER BY m.created_at ASC `;
    } else if (sort === 'votes_desc') {
        sql += ` ORDER BY score DESC `;
    } else if (sort === 'votes_asc') {
        sql += ` ORDER BY score ASC `;
    } else {
        sql += ` ORDER BY m.created_at DESC `; // date_desc (default)
    }

    // Aggiungo la paginazione
    sql += ` LIMIT ? OFFSET ? `;
    params.push(limit, offset);

    db.all(sql, params, callback);
}

function findMemeOfTheDay(callback) {
    // Cerca il meme più votato (score più alto) tra quelli caricati nell'ultimo giorno.
    // Se non ci sono meme recenti, l'algoritmo prenderà semplicemente il meme più votato di sempre.
    const sql = `
        SELECT m.*, u.username,
               COALESCE(SUM(CASE WHEN v.type = 1 THEN 1 ELSE 0 END), 0) - 
               COALESCE(SUM(CASE WHEN v.type = -1 THEN 1 ELSE 0 END), 0) AS score
        FROM memes m
        LEFT JOIN users u ON m.user_id = u.id
        LEFT JOIN votes v ON m.id = v.meme_id
        GROUP BY m.id
        ORDER BY 
            CASE WHEN m.created_at >= datetime('now', '-1 day') THEN 1 ELSE 0 END DESC,
            score DESC, 
            m.created_at DESC
        LIMIT 1
    `;
    db.get(sql, [], callback);
}

function findById(memeId, callback) {
    db.get(`SELECT * FROM memes WHERE id = ?`, [memeId], callback);
}

function remove(memeId, callback) {
    db.run(`DELETE FROM memes WHERE id = ?`, [memeId], callback);
}

module.exports = { create, findOrCreateTag, linkTag, findAll, findMemeOfTheDay, findById, remove };
