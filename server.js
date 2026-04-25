const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Charge les variables du fichier .env
dotenv.config();

const app = express();

// ── Middlewares ───────────────────────────────────
app.use(cors()); // Autorise les requêtes du front-end React
app.use(express.json()); // Permet de lire le JSON dans les requêtes

// ── Import des routes ─────────────────────────

// Routes d'authentification
const authRoutes = require("./routes/authRoutes");

//Routes departement
const departementRoutes = require("./routes/departementRoutes");

// Routes année academique
const anneeRoutes = require("./routes/anneeAcademiqueRoutes");

// Routes enseignant
const enseignantRoutes = require("./routes/enseignantRoutes");

// Route Matière
const matiereRoutes = require("./routes/matiereRoutes");

//Route heure effectuée
const heureRoutes = require("./routes/heureEffectueeRoutes");

// Route Parametre equivalence
const parametreRoutes   = require('./routes/parametreEquivalenceRoutes');

// Route utilisateur
const utilisateurRoutes = require('./routes/utilisateurRoutes');

// Route dashboard
const dashboardRoutes   = require('./routes/dashboardRoutes');


const logRoutes    = require('./routes/logActionRoutes');
const exportRoutes = require('./routes/exportRoutes');

// app.use((req, res, next) => {
//   console.log(`[${req.method}] ${req.url}`);
//   next();
// });

// ── Branchement des routes ────────────────────

// Toutes les routes auth commencent par /api/auth
app.use("/api/auth", authRoutes);

// Toutes les routes departement commencent par /api/departements
app.use("/api/departements", departementRoutes);

// Toute les routes année academique commencent par /api/annees
app.use("/api/annees", anneeRoutes);

// Toutes les routes enseignant commence par /api/enseignants
app.use("/api/enseignants", enseignantRoutes);

// Toutes les routes matière commencent par /api/matieres
app.use("/api/matieres", matiereRoutes);

// Toutes les routes heure effectuée commencent par /api/heures
app.use("/api/heures", heureRoutes)

// Toutes les routes parametre commencent par /api/parametre
app.use('/api/parametres',    parametreRoutes);

// Toutes les routes utilisateur commencent par /api/utilisateur
app.use('/api/utilisateurs',  utilisateurRoutes);

// Toutes les routes dashboard commencent par /api/dashboard
app.use('/api/dashboard',     dashboardRoutes);


app.use('/api/logs',    logRoutes);
app.use('/api/exports', exportRoutes);

// ── Route de test ─────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Serveur GesHeure opérationnel !" });
});

// ── Lancement du serveur ──────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
