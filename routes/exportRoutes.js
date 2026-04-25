const express = require("express");
const router = express.Router();
const {
  fichePDF,
  etatGlobalExcel,
} = require("../controllers/exportController");
const { verifierToken, verifierRole } = require("../middlewares/auth");

router.get("/fiche/:id_enseignant", verifierToken, fichePDF);
router.get(
  "/etat-global",
  verifierToken,
  verifierRole("Administrateur", "RH"),
  etatGlobalExcel,
);

module.exports = router;