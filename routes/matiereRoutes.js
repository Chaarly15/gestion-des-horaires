const express = require("express");
const router = express.Router();
const {
  getAll,
  getById,
  getByDepartement,
  getByFiliere,
  getByNiveau,
  create,
  update,
  delete: deleteMatiere,
} = require("../controllers/matiereController");
const { verifierToken, verifierRole } = require("../middlewares/auth");

// ─── Routes spécifiques AVANT /:id ──────────
router.get("/departement/:id_departement", verifierToken, getByDepartement);
router.get("/filiere/:filiere", verifierToken, getByFiliere);
router.get("/niveau/:niveau", verifierToken, getByNiveau);

// ─── Routes génériques ───────────────────────
router.get("/", verifierToken, getAll);
router.get("/:id", verifierToken, getById);
router.post("/", verifierToken, verifierRole("Administrateur", "RH"), create);
router.put("/:id", verifierToken, verifierRole("Administrateur", "RH"), update);
router.delete(
  "/:id",
  verifierToken,
  verifierRole("Administrateur", "RH"),
  deleteMatiere,
);

module.exports = router;
