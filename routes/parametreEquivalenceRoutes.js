const express = require("express");
const router = express.Router();
const {
  getAll,
  getByAnnee,
  create,
  update,
  delete: deleteParametre,
} = require("../controllers/parametreEquivalenceController");
const { verifierToken, verifierRole } = require("../middlewares/auth");

router.get("/annee/:id_annee", verifierToken, getByAnnee);
router.get("/", verifierToken, getAll);
router.post("/", verifierToken, verifierRole("Administrateur"), create);
router.put("/:id", verifierToken, verifierRole("Administrateur"), update);
router.delete(
  "/:id",
  verifierToken,
  verifierRole("Administrateur"),
  deleteParametre,
);

module.exports = router;