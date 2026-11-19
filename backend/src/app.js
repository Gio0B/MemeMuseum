const express = require('express');
const cors = require('cors');

// Inizializza la connessione al database e crea le tabelle se non esistono già
require('./db/database');

const { UPLOAD_DIR } = require('./config/config');

const authRoutes = require('./routes/auth.routes');
const memeRoutes = require('./routes/meme.routes');
const commentRoutes = require('./routes/comment.routes');
const memeController = require('./controllers/meme.controller');

const app = express();

app.use(cors());
app.use(express.json()); // Lettura dati json

// Rendo la cartella 'uploads' accessibile pubblicamente via URL
app.use('/uploads', express.static(UPLOAD_DIR));

// Route di base
app.get('/api', (req, res) => {
    res.json({ message: "Benvenuto su MemeMuseum API!" });
});

app.use('/api', authRoutes);                 // /api/register, /api/login
app.use('/api/memes', memeRoutes);            // /api/memes, /api/memes/:id, /api/memes/:id/vote, /api/memes/:id/comments
app.use('/api/comments', commentRoutes);      // /api/comments/:id

// Route per il meme del giorno (percorso a sé, non annidato sotto /api/memes)
app.get('/api/meme-of-the-day', memeController.getMemeOfTheDay);

module.exports = app;
