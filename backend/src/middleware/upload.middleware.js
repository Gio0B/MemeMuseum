const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { UPLOAD_DIR } = require('../config/config');

// Crea la cartella 'uploads' se non esiste ancora
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configurazione di Multer per definire dove e come salvare i file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR); // Salva i file nella cartella 'uploads'
    },
    filename: (req, file, cb) => {
        // Rinomina il file per evitare duplicati (timestamp.estensione)
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
