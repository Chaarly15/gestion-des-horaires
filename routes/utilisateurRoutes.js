const express = require("express");
const router = express.Router();
const {
  getAll,
  getById,
  create,
  update,
  delete: deleteUtilisateur,
  resetMotDePasse,
} = require("../controllers/utilisateurController");
const { verifierToken, verifierRole } = require("../middlewares/auth");

const adminOnly = [verifierToken, verifierRole("Administrateur")];

router.get("/", ...adminOnly, getAll);
router.get("/:id", ...adminOnly, getById);
router.post("/", ...adminOnly, create);
router.put("/:id", ...adminOnly, update);
router.delete("/:id", ...adminOnly, deleteUtilisateur);
router.put("/:id/reset-password", ...adminOnly, resetMotDePasse);

module.exports = router;