const express = require("express");
const router = express.Router();
const {
  getAll,
  getByUtilisateur,
  delete: deleteLogs,
} = require("../controllers/logActionController");
const { verifierToken, verifierRole } = require("../middlewares/auth");

const adminOnly = [verifierToken, verifierRole("Administrateur")];

router.get("/", ...adminOnly, getAll);
router.get("/utilisateur/:id", ...adminOnly, getByUtilisateur);
router.delete("/", ...adminOnly, deleteLogs);

module.exports = router;
