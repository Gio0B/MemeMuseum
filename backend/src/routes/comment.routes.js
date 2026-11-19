const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const authenticateToken = require('../middleware/auth.middleware');

// DELETE /api/comments/:id - cancellazione di un commento (solo l'autore)
router.delete('/:id', authenticateToken, commentController.deleteComment);

module.exports = router;
