const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');
const userModel = require('../models/user.model');

// Route registrazione
async function register(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
    }

    try {
        // Hash password per migliorare la sicurezza
        const hashedPassword = await bcrypt.hash(password, 10);

        userModel.create(username, email, hashedPassword, function (err) {
            if (err) {
                return res.status(400).json({ error: "Username o Email già esistenti" });
            }
            res.status(201).json({ message: "Utente registrato con successo", userId: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ error: "Errore nel server" });
    }
}

// Route di login
function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email e password obbligatorie" });
    }

    userModel.findByEmail(email, async (err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: "Credenziali errate" });
        }

        // Confronto la password inserita con quella criptata nel DB
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Credenziali errate" });
        }

        // Genero il token JWT che l'utente userà per le prossime richieste protette
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });

        res.json({ message: "Login effettuato", token, user: { id: user.id, username: user.username } });
    });
}

module.exports = { register, login };
