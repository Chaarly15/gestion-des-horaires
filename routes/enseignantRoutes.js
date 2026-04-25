const express = require('express');
const router  = express.Router();
const {
  getAll,
  getById,
  getByDepartement,
  create,
  update,
  delete: deleteEnseignant,
  getRecapitulatif
} = require('../controllers/enseignantController');
const {
  verifierToken,
  verifierRole
} = require('../middlewares/auth');

// ─────────────────────────────────────────────
// IMPORTANT : les routes spécifiques
// (/departement/:id et /:id/recapitulatif)
// doivent être déclarées AVANT /:id
// ─────────────────────────────────────────────

// GET /api/enseignants/departement/:id → tous les rôles
router.get(
  '/departement/:id_departement',
  verifierToken,
  getByDepartement
);

// GET /api/enseignants/:id/recapitulatif → tous les rôles
router.get(
  '/:id/recapitulatif',
  verifierToken,
  getRecapitulatif
);

// GET    /api/enseignants        → tous les rôles
router.get(    '/',    verifierToken, getAll);

// GET    /api/enseignants/:id    → tous les rôles
router.get(    '/:id', verifierToken, getById);

// POST   /api/enseignants        → Admin + RH
router.post(
  '/',
  verifierToken,
  verifierRole('Administrateur', 'RH'),
  create
);

// PUT    /api/enseignants/:id    → Admin + RH
router.put(
  '/:id',
  verifierToken,
  verifierRole('Administrateur', 'RH'),
  update
);

// DELETE /api/enseignants/:id   → Admin + RH
router.delete(
  '/:id',
  verifierToken,
  verifierRole('Administrateur', 'RH'),
  deleteEnseignant
);

module.exports = router;