const {
  Enseignant,
  Departement,
  HeureEffectuee,
  Utilisateur,
  AnneeAcademique,
  Matiere,
} = require("../models");
const { LogAction } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../models").sequelize;

// ─────────────────────────────────────────────
// getAll
// Retourne tous les enseignants avec
// leur département et le total de leurs heures
// GET /api/enseignants
// ─────────────────────────────────────────────
const getAll = async (req, res) => {
  try {
    // req.query = les paramètres dans l'URL
    // ex : /api/enseignants?statut=Permanent&id_departement=2
    const { statut, grade, id_departement } = req.query;

    // On construit le filtre dynamiquement
    // selon les paramètres fournis dans l'URL
    const where = {};
    if (statut) where.statut = statut;
    if (grade) where.grade = grade;
    if (id_departement) where.id_departement = id_departement;

    const enseignants = await Enseignant.findAll({
      where,
      include: [
        {
          model: Departement,
          as: "departement",
          attributes: ["id", "nom_departement"],
        },
      ],
      order: [
        ["nom", "ASC"],
        ["prenom", "ASC"],
      ],
    });

    return res.status(200).json({
      success: true,
      total: enseignants.length,
      data: enseignants,
    });
  } catch (error) {
    console.error("Erreur getAll enseignants :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};

// ─────────────────────────────────────────────
// getById
// Retourne UN enseignant avec son département
// et ses heures effectuées
// GET /api/enseignants/:id
// ─────────────────────────────────────────────
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const enseignant = await Enseignant.findByPk(id, {
      include: [
        {
          model: Departement,
          as: "departement",
          attributes: ["id", "nom_departement"],
        },
        {
          model: HeureEffectuee,
          as: "heures",
          // On inclut aussi la matière de chaque heure
          include: [
            {
              model: Matiere,
              as: "matiere",
              attributes: ["id", "intitule", "filiere", "niveau"],
            },
          ],
          order: [["date_cours", "DESC"]],
        },
      ],
    });

    if (!enseignant) {
      return res.status(404).json({
        success: false,
        message: `Enseignant avec l'id ${id} introuvable.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: enseignant,
    });
  } catch (error) {
    console.error("Erreur getById enseignant :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};

// ─────────────────────────────────────────────
// getByDepartement
// Retourne tous les enseignants
// d'un département donné
// GET /api/enseignants/departement/:id_departement
// ─────────────────────────────────────────────
const getByDepartement = async (req, res) => {
  try {
    const { id_departement } = req.params;

    // On vérifie que le département existe
    const dept = await Departement.findByPk(id_departement);
    if (!dept) {
      return res.status(404).json({
        success: false,
        message: `Département avec l'id ${id_departement} introuvable.`,
      });
    }

    const enseignants = await Enseignant.findAll({
      where: { id_departement },
      include: [
        {
          model: Departement,
          as: "departement",
          attributes: ["id", "nom_departement"],
        },
      ],
      order: [["nom", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      departement: dept.nom_departement,
      total: enseignants.length,
      data: enseignants,
    });
  } catch (error) {
    console.error("Erreur getByDepartement :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};

// ─────────────────────────────────────────────
// create
// Crée un nouvel enseignant
// Admin / RH
// POST /api/enseignants
// ─────────────────────────────────────────────
const create = async (req, res) => {
  try {
    const { nom, prenom, grade, statut, taux_horaire, id_departement } =
      req.body;

    // 1. Vérification des champs obligatoires
    if (!nom || !prenom || !grade || !statut || !id_departement) {
      return res.status(400).json({
        success: false,
        message: "Nom, prénom, grade, statut et département sont obligatoires.",
      });
    }

    // 2. Le département existe-t-il ?
    const dept = await Departement.findByPk(id_departement);
    if (!dept) {
      return res.status(404).json({
        success: false,
        message: `Département avec l'id ${id_departement} introuvable.`,
      });
    }

    // 3. Création
    const nouvelEnseignant = await Enseignant.create({
      nom: nom.trim(),
      prenom: prenom.trim(),
      grade,
      statut,
      taux_horaire: taux_horaire || 0,
      id_departement,
    });

    // 4. On recharge avec le département inclus
    //    pour retourner des données complètes
    const result = await Enseignant.findByPk(nouvelEnseignant.id, {
      include: [{ model: Departement, as: "departement" }],
    });

    // 5. Log
    await LogAction.create({
      action: `Création enseignant : ${nom} ${prenom}`,
      table_concernee: "enseignants",
      id_utilisateur: req.utilisateur.id,
    });

    return res.status(201).json({
      success: true,
      message: "Enseignant créé avec succès.",
      data: result,
    });
  } catch (error) {
    console.error("Erreur create enseignant :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};

// ─────────────────────────────────────────────
// update
// Modifie les infos d'un enseignant
// Admin / RH
// PUT /api/enseignants/:id
// ─────────────────────────────────────────────
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, grade, statut, taux_horaire, id_departement } =
      req.body;

    // 1. L'enseignant existe-t-il ?
    const enseignant = await Enseignant.findByPk(id);
    if (!enseignant) {
      return res.status(404).json({
        success: false,
        message: `Enseignant avec l'id ${id} introuvable.`,
      });
    }

    // 2. Si on change de département, il doit exister
    if (id_departement) {
      const dept = await Departement.findByPk(id_departement);
      if (!dept) {
        return res.status(404).json({
          success: false,
          message: `Département avec l'id ${id_departement} introuvable.`,
        });
      }
    }

    const ancienNom = `${enseignant.nom} ${enseignant.prenom}`;

    // 3. Mise à jour partielle
    await enseignant.update({
      nom: nom ? nom.trim() : enseignant.nom,
      prenom: prenom ? prenom.trim() : enseignant.prenom,
      grade: grade || enseignant.grade,
      statut: statut || enseignant.statut,
      taux_horaire: taux_horaire ?? enseignant.taux_horaire,
      id_departement: id_departement || enseignant.id_departement,
    });

    // 4. Recharge avec département
    const result = await Enseignant.findByPk(id, {
      include: [{ model: Departement, as: "departement" }],
    });

    // 5. Log
    await LogAction.create({
      action: `Modification enseignant : "${ancienNom}"`,
      table_concernee: "enseignants",
      id_utilisateur: req.utilisateur.id,
    });

    return res.status(200).json({
      success: true,
      message: "Enseignant modifié avec succès.",
      data: result,
    });
  } catch (error) {
    console.error("Erreur update enseignant :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};

// ─────────────────────────────────────────────
// deleteEnseignant
// Supprime un enseignant
// Impossible si des heures lui sont rattachées
// Admin / RH
// DELETE /api/enseignants/:id
// ─────────────────────────────────────────────
const deleteEnseignant = async (req, res) => {
  try {
    const { id } = req.params;

    const enseignant = await Enseignant.findByPk(id);
    if (!enseignant) {
      return res.status(404).json({
        success: false,
        message: `Enseignant avec l'id ${id} introuvable.`,
      });
    }

    // Vérification : des heures lui sont-elles rattachées ?
    const nbHeures = await HeureEffectuee.count({
      where: { id_enseignant: id },
    });

    if (nbHeures > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer. ${nbHeures} heure(s) effectuée(s) sont rattachées à cet enseignant.`,
      });
    }

    // Vérification : a-t-il un compte utilisateur ?
    const compte = await Utilisateur.findOne({
      where: { id_enseignant: id },
    });

    if (compte) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer. Cet enseignant possède un compte utilisateur. Supprimez d'abord le compte.`,
      });
    }

    const nomSupp = `${enseignant.nom} ${enseignant.prenom}`;
    await enseignant.destroy();

    await LogAction.create({
      action: `Suppression enseignant : ${nomSupp}`,
      table_concernee: "enseignants",
      id_utilisateur: req.utilisateur.id,
    });

    return res.status(200).json({
      success: true,
      message: `Enseignant "${nomSupp}" supprimé avec succès.`,
    });
  } catch (error) {
    console.error("Erreur delete enseignant :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};

// ─────────────────────────────────────────────
// getRecapitulatif
// Calcule pour un enseignant sur une année :
// - Total heures par type (CM / TD / TP)
// - Total heures normales
// - Total heures complémentaires
// - Montant total à payer
// GET /api/enseignants/:id/recapitulatif?id_annee=1
// ─────────────────────────────────────────────
const getRecapitulatif = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_annee } = req.query;

    // 1. L'enseignant existe-t-il ?
    const enseignant = await Enseignant.findByPk(id, {
      include: [{ model: Departement, as: "departement" }],
    });

    if (!enseignant) {
      return res.status(404).json({
        success: false,
        message: `Enseignant avec l'id ${id} introuvable.`,
      });
    }

    // 2. Filtrer par année si fournie,
    //    sinon prendre toutes les heures
    const whereHeures = { id_enseignant: id };
    let annee = null;

    if (id_annee) {
      whereHeures.id_annee = id_annee;
      annee = await AnneeAcademique.findByPk(id_annee);
      if (!annee) {
        return res.status(404).json({
          success: false,
          message: `Année académique introuvable.`,
        });
      }
    }

    // 3. Récupération de toutes les heures de l'enseignant
    const heures = await HeureEffectuee.findAll({
      where: whereHeures,
    });

    // 4. Calcul des totaux par type
    //    On utilise reduce() pour additionner les durées
    //    grouped par type d'heure
    const totalCM = heures
      .filter((h) => h.type_heure === "CM")
      .reduce((sum, h) => sum + parseFloat(h.duree), 0);

    const totalTD = heures
      .filter((h) => h.type_heure === "TD")
      .reduce((sum, h) => sum + parseFloat(h.duree), 0);

    const totalTP = heures
      .filter((h) => h.type_heure === "TP")
      .reduce((sum, h) => sum + parseFloat(h.duree), 0);

    // 5. Total toutes heures confondues
    const totalHeures = totalCM + totalTD + totalTP;

    // 6. Quota contractuel selon le statut de l'enseignant
    //    Si une année est sélectionnée, on prend son quota
    //    Sinon on met 0 (pas de référence)
    let quotaContractuel = 0;
    if (annee) {
      quotaContractuel =
        enseignant.statut === "Permanent"
          ? parseFloat(annee.h_contract_permanent)
          : parseFloat(annee.h_contract_vacataire);
    }

    // 7. Calcul des heures complémentaires
    //    = heures au-delà du quota (minimum 0)
    const heuresComplementaires = Math.max(0, totalHeures - quotaContractuel);

    // 8. Heures normales = total - complémentaires
    const heuresNormales = totalHeures - heuresComplementaires;

    // 9. Montant total à payer
    //    = heures complémentaires × taux horaire
    const montantTotal =
      heuresComplementaires * parseFloat(enseignant.taux_horaire);

    return res.status(200).json({
      success: true,
      data: {
        enseignant: {
          id: enseignant.id,
          nom: enseignant.nom,
          prenom: enseignant.prenom,
          grade: enseignant.grade,
          statut: enseignant.statut,
          taux_horaire: enseignant.taux_horaire,
          departement: enseignant.departement?.nom_departement,
        },
        annee: annee ? annee.libelle : "Toutes années",
        recap: {
          total_CM: parseFloat(totalCM.toFixed(2)),
          total_TD: parseFloat(totalTD.toFixed(2)),
          total_TP: parseFloat(totalTP.toFixed(2)),
          total_heures: parseFloat(totalHeures.toFixed(2)),
          quota_contractuel: parseFloat(quotaContractuel.toFixed(2)),
          heures_normales: parseFloat(heuresNormales.toFixed(2)),
          heures_complementaires: parseFloat(heuresComplementaires.toFixed(2)),
          montant_total: parseFloat(montantTotal.toFixed(2)),
          en_depassement: heuresComplementaires > 0,
        },
      },
    });
  } catch (error) {
    console.error("Erreur getRecapitulatif :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};

module.exports = {
  getAll,
  getById,
  getByDepartement,
  create,
  update,
  delete: deleteEnseignant,
  getRecapitulatif,
};
