const commentModel = require('../models/comment.model');

// Route per aggiungere un commento (protetta)
function addComment(req, res) {
    const { text } = req.body;
    const memeId = req.params.id;
    const userId = req.user.id;

    if (!text) {
        return res.status(400).json({ error: "Il testo del commento è obbligatorio" });
    }

    commentModel.create(text, userId, memeId, function (err) {
        if (err) {
            return res.status(500).json({ error: "Errore durante il salvataggio del commento" });
        }
        res.status(201).json({ message: "Commento aggiunto!", commentId: this.lastID });
    });
}

// Route per recuperare i commenti (pubblica)
function getComments(req, res) {
    const memeId = req.params.id;
    commentModel.findByMemeId(memeId, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Errore nel recupero dei commenti" });
        }
        res.json({ comments: rows });
    });
}

// Route per cancellare un commento (solo chi ha scritto il commento può farlo)
function deleteComment(req, res) {
    const commentId = req.params.id;
    const userId = req.user.id;

    // Controllo prima se il commento appartiene all'utente che sta provando a cancellarlo
    commentModel.findById(commentId, (err, comment) => {
        if (err || !comment) return res.status(404).json({ error: "Commento non trovato" });
        if (comment.user_id !== userId) return res.status(403).json({ error: "Non sei autorizzato a cancellare questo commento" });

        // Dopo la verifica procedo con la cancellazione del commento
        commentModel.remove(commentId, (deleteErr) => {
            if (deleteErr) return res.status(500).json({ error: "Errore nel database" });
            res.json({ message: "Commento cancellato con successo!" });
        });
    });
}

module.exports = { addComment, getComments, deleteComment };
