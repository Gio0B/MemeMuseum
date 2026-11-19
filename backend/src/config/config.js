const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');

const JWT_SECRET =
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV !== 'production'
        ? 'password_di_prova'
        : null);

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET must be configured in production.');
}

module.exports = {
    PORT: process.env.PORT || 3000,
    JWT_SECRET,

    ROOT_DIR,
    UPLOAD_DIR: path.join(ROOT_DIR, 'uploads'),
    DB_PATH: path.join(ROOT_DIR, 'database.sqlite'),
};