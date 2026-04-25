const express = require("express");
const router = express.Router();
const {
  getStats,
  getHeuresParDepartement,
  getRepartitionCMTDTP,
  getTopEnseignants,
  getEnseignantsEnDepassement,
} = require("../controllers/dashboardController");
const { verifierToken, verifierRole } = require("../middlewares/auth");

router.get("/stats", verifierToken, getStats);
router.get("/heures-par-departement", verifierToken, getHeuresParDepartement);
router.get("/repartition", verifierToken, getRepartitionCMTDTP);
router.get("/top-enseignants", verifierToken, getTopEnseignants);
router.get(
  "/depassements",
  verifierToken,
  verifierRole("Administrateur", "RH"),
  getEnseignantsEnDepassement,
);

module.exports = router;
