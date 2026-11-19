const express = require('express');
const router = express.Router();
const memeController = require('../controllers/meme.controller');
const commentController = require('../controllers/comment.controller');
const authenticateToken = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// GET /api/memes - lista pubblica dei meme (filtri, ordinamento, paginazione)
router.get('/', memeController.getMemes);

// POST /api/memes - caricamento di un nuovo meme (richiede login + immagine)
router.post('/', authenticateToken, upload.single('image'), memeController.uploadMeme);

// DELETE /api/memes/:id - cancellazione di un meme (solo l'autore)
router.delete('/:id', authenticateToken, memeController.deleteMeme);

// POST /api/memes/:id/vote - upvote/downvote su un meme (richiede login)
router.post('/:id/vote', authenticateToken, memeController.voteMeme);

// GET /api/memes/:id/comments - commenti di un meme (pubblica)
router.get('/:id/comments', commentController.getComments);

// POST /api/memes/:id/comments - aggiunta di un commento (richiede login)
router.post('/:id/comments', authenticateToken, commentController.addComment);

module.exports = router;
