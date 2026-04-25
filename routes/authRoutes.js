const express    = require('express');
const router     = express.Router();
const {
  login,
  getMonProfil,
  changerMotDePasse
} = require('../controllers/authController');
const {
  verifierToken
} = require('../middlewares/auth');

// ─────────────────────────────────────────────
// Route publique — pas besoin de token
// POST /api/auth/login
// ─────────────────────────────────────────────
router.post('/login', login);

// ─────────────────────────────────────────────
// Routes protégées — token obligatoire
// verifierToken est le middleware qui vérifie
// ─────────────────────────────────────────────
router.get('/profil',              verifierToken, getMonProfil);
router.put('/changer-mot-de-passe',verifierToken, changerMotDePasse);

module.exports = router;