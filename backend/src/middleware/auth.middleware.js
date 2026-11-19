const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');

// Middleware per proteggere le rotte.
// Legge il token dall'header 'Authorization' (formato standard "Bearer TOKEN"),
// lo verifica e, se valido, salva i dati dell'utente in req.user così le
// rotte successive sanno chi sta navigando.
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Accesso negato. Token mancante." });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Token non valido o scaduto." });
        }

        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
