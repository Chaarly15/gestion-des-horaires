const express    = require('express');
const router     = express.Router();
const {
  getAll,
  getById,
  create,
  update,
  delete: deleteDepartement
} = require('../controllers/departementController');
const {
  verifierToken,
  verifierRole
} = require('../middlewares/auth');

// ─────────────────────────────────────────────
// Toutes ces routes nécessitent un token valide
// verifierToken est appliqué sur toutes les routes
// ─────────────────────────────────────────────

// GET  /api/departements        → tous les rôles
router.get(
  '/',
  verifierToken,
  getAll
);

// GET  /api/departements/:id    → tous les rôles
router.get(
  '/:id',
  verifierToken,
  getById
);

// POST /api/departements        → Admin seulement
router.post(
  '/',
  verifierToken,
  verifierRole('Administrateur'),
  create
);

// PUT  /api/departements/:id    → Admin seulement
router.put(
  '/:id',
  verifierToken,
  verifierRole('Administrateur'),
  update
);

// DELETE /api/departements/:id  → Admin seulement
router.delete(
  '/:id',
  verifierToken,
  verifierRole('Administrateur'),
  deleteDepartement
);

module.exports = router;