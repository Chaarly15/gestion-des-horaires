const bcrypt = require("bcryptjs");
const { Utilisateur, Enseignant } = require("../models");
const { LogAction } = require("../models");

// ─────────────────────────────────────────────
// getAll
// Retourne tous les utilisateurs
// SANS leurs mots de passe
// Admin uniquement
// GET /api/utilisateurs
// ─────────────────────────────────────────────
const getAll = async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.findAll({
      // exclude exclut des colonnes de la réponse
      // le mot de passe ne doit JAMAIS être envoyé
      attributes: { exclude: ["mot_de_passe"] },
      include: [
        {
          model: Enseignant,
          as: "enseignant",
          attributes: ["id", "nom", "prenom", "grade"],
          required: false, // LEFT JOIN : garde les utilisateurs sans enseignant
        },
      ],
      order: [
        ["role", "ASC"],
        ["login", "ASC"],
      ],
    });

    return res.status(200).json({
      success: true,
      total: utilisateurs.length,
      data: utilisateurs,
    });
  } catch (error) {
    console.error("Erreur getAll utilisateurs :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// ─────────────────────────────────────────────
// getById
// Retourne UN utilisateur par son ID
// Admin uniquement
// GET /api/utilisateurs/:id
// ─────────────────────────────────────────────
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const utilisateur = await Utilisateur.findByPk(id, {
      attributes: { exclude: ["mot_de_passe"] },
      include: [
        {
          model: Enseignant,
          as: "enseignant",
          required: false,
        },
      ],
    });

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: `Utilisateur avec l'id ${id} introuvable.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: utilisateur,
    });
  } catch (error) {
    console.error("Erreur getById utilisateur :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// ─────────────────────────────────────────────
// create
// Crée un nouveau compte utilisateur
// Hashe automatiquement le mot de passe
// Admin uniquement
// POST /api/utilisateurs
// ─────────────────────────────────────────────
const create = async (req, res) => {
  try {
    const { login, mot_de_passe, role, id_enseignant } = req.body;

    // 1. Champs obligatoires
    if (!login || !mot_de_passe || !role) {
      return res.status(400).json({
        success: false,
        message: "Login, mot de passe et rôle sont obligatoires.",
      });
    }

    // 2. Longueur minimum du mot de passe
    if (mot_de_passe.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Le mot de passe doit contenir au moins 6 caractères.",
      });
    }

    // 3. Le login est-il déjà utilisé ?
    const existeDeja = await Utilisateur.findOne({
      where: { login: login.trim() },
    });

    if (existeDeja) {
      return res.status(409).json({
        success: false,
        message: `Le login "${login}" est déjà utilisé.`,
      });
    }

    // 4. Si rôle Enseignant, l'id_enseignant est obligatoire
    if (role === "Enseignant" && !id_enseignant) {
      return res.status(400).json({
        success: false,
        message: "Un compte Enseignant doit être lié à un enseignant existant.",
      });
    }

    // 5. Si id_enseignant fourni, il doit exister
    if (id_enseignant) {
      const enseignant = await Enseignant.findByPk(id_enseignant);
      if (!enseignant) {
        return res.status(404).json({
          success: false,
          message: `Enseignant avec l'id ${id_enseignant} introuvable.`,
        });
      }

      // Un enseignant ne peut avoir qu'un seul compte
      const compteExiste = await Utilisateur.findOne({
        where: { id_enseignant },
      });

      if (compteExiste) {
        return res.status(409).json({
          success: false,
          message: `Cet enseignant possède déjà un compte utilisateur.`,
        });
      }
    }

    // 6. Hashage du mot de passe
    //    10 = nombre de "rounds" de bcrypt
    //    Plus c'est élevé → plus sécurisé mais plus lent
    const motDePasseHashe = await bcrypt.hash(mot_de_passe, 10);

    // 7. Création du compte
    const nouvelUtilisateur = await Utilisateur.create({
      login: login.trim(),
      mot_de_passe: motDePasseHashe,
      role,
      id_enseignant: id_enseignant || null,
    });

    await LogAction.create({
      action: `Création compte utilisateur : ${login} (${role})`,
      table_concernee: "utilisateurs",
      id_utilisateur: req.utilisateur.id,
    });

    // On retourne le compte SANS le mot de passe
    return res.status(201).json({
      success: true,
      message: "Compte utilisateur créé avec succès.",
      data: {
        id: nouvelUtilisateur.id,
        login: nouvelUtilisateur.login,
        role: nouvelUtilisateur.role,
        id_enseignant: nouvelUtilisateur.id_enseignant,
      },
    });
  } catch (error) {
    console.error("Erreur create utilisateur :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// ─────────────────────────────────────────────
// update
// Modifie le rôle ou l'enseignant lié
// Admin uniquement
// PUT /api/utilisateurs/:id
// ─────────────────────────────────────────────
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { login, role, id_enseignant } = req.body;

    const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: `Utilisateur avec l'id ${id} introuvable.`,
      });
    }

    // Vérification doublon login sur un AUTRE compte
    if (login && login.trim() !== utilisateur.login) {
      const doublon = await Utilisateur.findOne({
        where: { login: login.trim() },
      });
      if (doublon) {
        return res.status(409).json({
          success: false,
          message: `Le login "${login}" est déjà utilisé.`,
        });
      }
    }

    await utilisateur.update({
      login: login ? login.trim() : utilisateur.login,
      role: role || utilisateur.role,
      id_enseignant:
        id_enseignant !== undefined ? id_enseignant : utilisateur.id_enseignant,
    });

    await LogAction.create({
      action: `Modification compte utilisateur id:${id}`,
      table_concernee: "utilisateurs",
      id_utilisateur: req.utilisateur.id,
    });

    return res.status(200).json({
      success: true,
      message: "Compte utilisateur modifié avec succès.",
      data: {
        id: utilisateur.id,
        login: utilisateur.login,
        role: utilisateur.role,
        id_enseignant: utilisateur.id_enseignant,
      },
    });
  } catch (error) {
    console.error("Erreur update utilisateur :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// ─────────────────────────────────────────────
// deleteUtilisateur
// Supprime un compte utilisateur
// Admin uniquement — ne peut pas se supprimer soi-même
// DELETE /api/utilisateurs/:id
// ─────────────────────────────────────────────
const deleteUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;

    // Empêche de se supprimer soi-même
    if (parseInt(id) === req.utilisateur.id) {
      return res.status(400).json({
        success: false,
        message: "Vous ne pouvez pas supprimer votre propre compte.",
      });
    }

    const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: `Utilisateur avec l'id ${id} introuvable.`,
      });
    }

    const loginSupp = utilisateur.login;
    await utilisateur.destroy();

    await LogAction.create({
      action: `Suppression compte utilisateur : ${loginSupp}`,
      table_concernee: "utilisateurs",
      id_utilisateur: req.utilisateur.id,
    });

    return res.status(200).json({
      success: true,
      message: `Compte "${loginSupp}" supprimé avec succès.`,
    });
  } catch (error) {
    console.error("Erreur delete utilisateur :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// ─────────────────────────────────────────────
// resetMotDePasse
// Réinitialise le mot de passe d'un utilisateur
// Génère un mot de passe temporaire
// Admin uniquement
// PUT /api/utilisateurs/:id/reset-password
// ─────────────────────────────────────────────
const resetMotDePasse = async (req, res) => {
  try {
    const { id } = req.params;

    const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: `Utilisateur avec l'id ${id} introuvable.`,
      });
    }

    // Génère un mot de passe temporaire aléatoire
    // ex : "Temp@8472" — 8 caractères alphanumériques
    const motDePasseTemp = "Temp@" + Math.floor(1000 + Math.random() * 9000);
    const nouveauHash = await bcrypt.hash(motDePasseTemp, 10);

    await utilisateur.update({ mot_de_passe: nouveauHash });

    await LogAction.create({
      action: `Réinitialisation mot de passe : ${utilisateur.login}`,
      table_concernee: "utilisateurs",
      id_utilisateur: req.utilisateur.id,
    });

    // On retourne le mot de passe temporaire EN CLAIR
    // une seule fois — l'utilisateur devra le changer
    return res.status(200).json({
      success: true,
      message: `Mot de passe réinitialisé. Communiquez ce mot de passe temporaire à l'utilisateur.`,
      mot_de_passe_temporaire: motDePasseTemp,
    });
  } catch (error) {
    console.error("Erreur resetMotDePasse :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteUtilisateur,
  resetMotDePasse,
};