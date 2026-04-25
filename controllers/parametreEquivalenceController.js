const { ParametreEquivalence, AnneeAcademique } = require("../models");
const { LogAction } = require("../models");

// ─────────────────────────────────────────────
// getAll
// Retourne tous les paramètres d'équivalence
// avec leur année académique
// GET /api/parametres
// ─────────────────────────────────────────────
const getAll = async (req, res) => {
  try {
    const parametres = await ParametreEquivalence.findAll({
      include: [
        {
          model: AnneeAcademique,
          as: "annee",
          attributes: ["id", "libelle"],
        },
      ],
      order: [
        ["id_annee", "ASC"],
        ["type_source", "ASC"],
      ],
    });

    return res.status(200).json({
      success: true,
      total: parametres.length,
      data: parametres,
    });
  } catch (error) {
    console.error("Erreur getAll paramètres :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// ─────────────────────────────────────────────
// getByAnnee
// Retourne les équivalences d'une année donnée
// GET /api/parametres/annee/:id_annee
// ─────────────────────────────────────────────
const getByAnnee = async (req, res) => {
  try {
    const { id_annee } = req.params;

    const annee = await AnneeAcademique.findByPk(id_annee);
    if (!annee) {
      return res.status(404).json({
        success: false,
        message: `Année académique introuvable.`,
      });
    }

    const parametres = await ParametreEquivalence.findAll({
      where: { id_annee },
      include: [
        {
          model: AnneeAcademique,
          as: "annee",
          attributes: ["id", "libelle"],
        },
      ],
      order: [["type_source", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      annee: annee.libelle,
      total: parametres.length,
      data: parametres,
    });
  } catch (error) {
    console.error("Erreur getByAnnee paramètres :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// ─────────────────────────────────────────────
// create
// Crée un paramètre d'équivalence
// ex : 1h CM = 1.5h TD → source=CM, cible=TD, coef=1.5
// Admin uniquement
// POST /api/parametres
// ─────────────────────────────────────────────
const create = async (req, res) => {
  try {
    const { type_source, type_cible, coefficient, id_annee } = req.body;

    // 1. Vérification des champs obligatoires
    if (!type_source || !type_cible || !coefficient || !id_annee) {
      return res.status(400).json({
        success: false,
        message:
          "Type source, type cible, coefficient et année sont obligatoires.",
      });
    }

    // 2. type_source et type_cible doivent être différents
    if (type_source === type_cible) {
      return res.status(400).json({
        success: false,
        message: "Le type source et le type cible doivent être différents.",
      });
    }

    // 3. Le coefficient doit être positif
    if (parseFloat(coefficient) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Le coefficient doit être supérieur à 0.",
      });
    }

    // 4. L'année existe-t-elle ?
    const annee = await AnneeAcademique.findByPk(id_annee);
    if (!annee) {
      return res.status(404).json({
        success: false,
        message: `Année académique introuvable.`,
      });
    }

    // 5. Vérification doublon : même source + cible + année
    const existeDeja = await ParametreEquivalence.findOne({
      where: { type_source, type_cible, id_annee },
    });

    if (existeDeja) {
      return res.status(409).json({
        success: false,
        message: `Un paramètre ${type_source}→${type_cible} existe déjà pour l'année ${annee.libelle}.`,
      });
    }

    // 6. Création
    const nouveauParam = await ParametreEquivalence.create({
      type_source,
      type_cible,
      coefficient: parseFloat(coefficient),
      id_annee,
    });

    await LogAction.create({
      action: `Création équivalence : 1h ${type_source} = ${coefficient}h ${type_cible} (${annee.libelle})`,
      table_concernee: "parametre_equivalences",
      id_utilisateur: req.utilisateur.id,
    });

    return res.status(201).json({
      success: true,
      message: `Équivalence créée : 1h ${type_source} = ${coefficient}h ${type_cible}.`,
      data: nouveauParam,
    });
  } catch (error) {
    console.error("Erreur create paramètre :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// ─────────────────────────────────────────────
// update
// Modifie le coefficient d'un paramètre
// Admin uniquement
// PUT /api/parametres/:id
// ─────────────────────────────────────────────
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { coefficient } = req.body;

    if (!coefficient || parseFloat(coefficient) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Le coefficient doit être supérieur à 0.",
      });
    }

    const parametre = await ParametreEquivalence.findByPk(id, {
      include: [{ model: AnneeAcademique, as: "annee" }],
    });

    if (!parametre) {
      return res.status(404).json({
        success: false,
        message: `Paramètre avec l'id ${id} introuvable.`,
      });
    }

    const ancienCoef = parametre.coefficient;
    await parametre.update({ coefficient: parseFloat(coefficient) });

    await LogAction.create({
      action: `Modification équivalence : ${parametre.type_source}→${parametre.type_cible} : ${ancienCoef} → ${coefficient}`,
      table_concernee: "parametre_equivalences",
      id_utilisateur: req.utilisateur.id,
    });

    return res.status(200).json({
      success: true,
      message: "Coefficient mis à jour avec succès.",
      data: parametre,
    });
  } catch (error) {
    console.error("Erreur update paramètre :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// ─────────────────────────────────────────────
// deleteParametre
// Supprime un paramètre d'équivalence
// Admin uniquement
// DELETE /api/parametres/:id
// ─────────────────────────────────────────────
const deleteParametre = async (req, res) => {
  try {
    const { id } = req.params;

    const parametre = await ParametreEquivalence.findByPk(id, {
      include: [{ model: AnneeAcademique, as: "annee" }],
    });

    if (!parametre) {
      return res.status(404).json({
        success: false,
        message: `Paramètre avec l'id ${id} introuvable.`,
      });
    }

    const info = `${parametre.type_source}→${parametre.type_cible} (${parametre.annee?.libelle})`;
    await parametre.destroy();

    await LogAction.create({
      action: `Suppression équivalence : ${info}`,
      table_concernee: "parametre_equivalences",
      id_utilisateur: req.utilisateur.id,
    });

    return res.status(200).json({
      success: true,
      message: `Paramètre d'équivalence supprimé avec succès.`,
    });
  } catch (error) {
    console.error("Erreur delete paramètre :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

module.exports = {
  getAll,
  getByAnnee,
  create,
  update,
  delete: deleteParametre,
};
