const express = require("express");
const router = express.Router();
const {
  getAll,
  getById,
  getByEnseignant,
  getByAnnee,
  create,
  update,
  delete: deleteHeure,
  calculerTotaux,
  verifierDepassement,
} = require("../controllers/heureEffectueeController");
const { verifierToken, verifierRole } = require("../middlewares/auth");

// ─── Routes spécifiques AVANT /:id ──────────
router.get("/enseignant/:id_enseignant", verifierToken, getByEnseignant);
router.get("/annee/:id_annee", verifierToken, getByAnnee);
router.get("/totaux/:id_enseignant", verifierToken, calculerTotaux);
router.get("/depassement/:id_enseignant", verifierToken, verifierDepassement);

// ─── Routes génériques ───────────────────────
router.get("/", verifierToken, getAll);
router.get("/:id", verifierToken, getById);

router.post("/", verifierToken, verifierRole("Administrateur", "RH"), create);
router.put("/:id", verifierToken, verifierRole("Administrateur", "RH"), update);
router.delete(
  "/:id",
  verifierToken,
  verifierRole("Administrateur", "RH"),
  deleteHeure,
);

module.exports = router;
