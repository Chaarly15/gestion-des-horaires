const express = require('express');
const router  = express.Router();
const {
  getAll,
  getById,
  getCurrent,
  create,
  update,
  delete: deleteAnnee
} = require('../controllers/anneeAcademiqueController');
const {
  verifierToken,
  verifierRole
} = require('../middlewares/auth');

// ─────────────────────────────────────────────
// IMPORTANT : /current doit être déclaré
// AVANT /:id sinon Express croit que
// "current" est un id et ça plantera
// ─────────────────────────────────────────────

// GET  /api/annees/current → tous les rôles
router.get(
  '/current',
  verifierToken,
  getCurrent
);

// GET  /api/annees         → tous les rôles
router.get(
  '/',
  verifierToken,
  getAll
);

// GET  /api/annees/:id     → tous les rôles
router.get(
  '/:id',
  verifierToken,
  getById
);

// POST /api/annees         → Admin seulement
router.post(
  '/',
  verifierToken,
  verifierRole('Administrateur'),
  create
);

// PUT  /api/annees/:id     → Admin seulement
router.put(
  '/:id',
  verifierToken,
  verifierRole('Administrateur'),
  update
);

// DELETE /api/annees/:id   → Admin seulement
router.delete(
  '/:id',
  verifierToken,
  verifierRole('Administrateur'),
  deleteAnnee
);

module.exports = router;