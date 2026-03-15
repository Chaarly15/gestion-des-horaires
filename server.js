const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');

// Charge les variables du fichier .env
dotenv.config();

const app = express();

// ── Middlewares ───────────────────────────────────
app.use(cors());          // Autorise les requêtes du front-end React
app.use(express.json()); // Permet de lire le JSON dans les requêtes

// ── Route de test ─────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Serveur GesHeure opérationnel !' });
});

// ── Lancement du serveur ──────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});