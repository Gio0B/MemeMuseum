const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST /api/register - registrazione nuovo utente
router.post('/register', authController.register);

// POST /api/login - login utente esistente
router.post('/login', authController.login);

module.exports = router;
