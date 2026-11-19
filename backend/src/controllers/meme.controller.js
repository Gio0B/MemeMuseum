const path = require('path');
const fs = require('fs');
const { ROOT_DIR } = require('../config/config');
const memeModel = require('../models/meme.model');
const voteModel = require('../models/vote.model');

// Route per caricare i meme (protetta da authenticateToken + upload)
// 'image' è il nome del campo che il Front-End usa per inviare il file
function uploadMeme(req, res) {
    const { title, tags } = req.body; // tags sarà una stringa inviata dal client (es: "Gatto, Programming")

    if (!title || !req.file) {
        return res.status(400).json({ error: "Titolo e immagine sono obbligatori" });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    const userId = req.user.id; // Preso dal token grazie a authenticateToken

    // Inserisco il meme nel database
    memeModel.create(title, imagePath, userId, function (err) {
        if (err) {
            return res.status(500).json({ error: "Errore nel salvataggio del meme" });
        }

        const memeId = this.lastID;

        // Gestione dei Tag (se inviati)
        if (tags) {
            // Separiamo i tag inviati (es: "Gatto, Web" -> ["gatto", "web"])
            const tagList = tags.split(',').map(t => t.trim().toLowerCase());

            tagList.forEach(tagName => {
                memeModel.findOrCreateTag(tagName, (err, tag) => {
                    if (tag) {
                        // Collego il meme al tag nella tabella pivot
                        memeModel.linkTag(memeId, tag.id);
                    }
                });
            });
        }

        res.status(201).json({ message: "Meme caricato con successo!", memeId });
    });
}

// Route per cercare e visualizzare i meme (pubblica)
function getMemes(req, res) {
    // Recuperiamo i parametri dalla query URL (es: /api/memes?page=1&tag=Gatto&sort=date_desc)
    const page = parseInt(req.query.page) || 1;
    const tag = req.query.tag;
    const sort = req.query.sort || 'date_desc'; // Valore di default: più recenti prima

    memeModel.findAll({ page, tag, sort }, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Errore nel recupero dei meme" });
        }
        res.json({ page, limit: 9, memes: rows });
    });
}

// Route per il meme del giorno (pubblica)
function getMemeOfTheDay(req, res) {
    memeModel.findMemeOfTheDay((err, row) => {
        if (err) {
            return res.status(500).json({ error: "Errore nel recupero del meme del giorno" });
        }
        if (!row) {
            return res.status(404).json({ message: "Nessun meme presente nell'archivio" });
        }
        res.json({ memeOfTheDay: row });
    });
}

// Route per votare un meme (protetta)
function voteMeme(req, res) {
    const memeId = req.params.id;
    const { type } = req.body;
    const userId = req.user.id;

    if (type !== 1 && type !== -1) {
        return res.status(400).json({ error: "Voto non valido" });
    }

    // Controlla se esiste già un voto
    voteModel.findByUserAndMeme(userId, memeId, (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Errore database" });
        }

        // Se il voto esiste già ed è uguale -> rimuovi voto
        if (row && row.type === type) {
            voteModel.remove(userId, memeId, function (err) {
                if (err) {
                    return res.status(500).json({ error: "Errore rimozione voto" });
                }
                return res.json({ message: "Voto rimosso", removed: true });
            });
        } else {
            // Inserisce o aggiorna voto
            voteModel.upsert(userId, memeId, type, function (err) {
                if (err) {
                    return res.status(500).json({ error: "Errore salvataggio voto" });
                }
                return res.json({ message: "Voto salvato", removed: false, type });
            });
        }
    });
}

// Route per cancellare un meme (solo chi ha caricato il meme può farlo)
function deleteMeme(req, res) {
    const memeId = req.params.id;
    const userId = req.user.id;

    // Controllo prima se il meme appartiene all'utente che sta provando a cancellarlo
    memeModel.findById(memeId, (err, meme) => {
        if (err || !meme) return res.status(404).json({ error: "Meme non trovato" });
        if (meme.user_id !== userId) return res.status(403).json({ error: "Non sei autorizzato a cancellare questo meme" });

        // Elimino il file fisico dalla cartella 'uploads'
        const filePath = path.join(ROOT_DIR, meme.image_path);
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error("Errore eliminazione file fisico:", unlinkErr);

            // Elimino il record dal database (grazie a ON DELETE CASCADE eliminerà anche i voti/tag collegati)
            memeModel.remove(memeId, (deleteErr) => {
                if (deleteErr) return res.status(500).json({ error: "Errore nel database" });
                res.json({ message: "Meme eliminato con successo!" });
            });
        });
    });
}

module.exports = { uploadMeme, getMemes, getMemeOfTheDay, voteMeme, deleteMeme };
