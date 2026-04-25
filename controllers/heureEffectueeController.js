const {
  HeureEffectuee,
  Enseignant,
  Matiere,
  AnneeAcademique,
  Departement,
  ParametreEquivalence,
} = require("../models");
const { LogAction } = require("../models");
const { Op } = require("sequelize");

// ─────────────────────────────────────────────
// getAll
// Retourne toutes les heures effectuées
// Filtrable par enseignant, matière, année, type
// GET /api/heures
// ─────────────────────────────────────────────
const getAll = async (req, res) => {
  try {
    const { id_enseignant, id_matiere, id_annee, type_heure } = req.query;

    const where = {};
    if (id_enseignant) where.id_enseignant = id_enseignant;
    if (id_matiere) where.id_matiere = id_matiere;
    if (id_annee) where.id_annee = id_annee;
    if (type_heure) where.type_heure = type_heure;

    const heures = await HeureEffectuee.findAll({
      where,
      include: [
        {
          model: Enseignant,
          as: "enseignant",
          attributes: ["id", "nom", "prenom", "grade", "statut"],
        },
        {
          model: Matiere,
          as: "matiere",
          attributes: ["id", "intitule", "filiere", "niveau"],
        },
        {
          model: AnneeAcademique,
          as: "annee",
          attributes: ["id", "libelle"],
        },
      ],
      order: [["date_cours", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      total: heures.length,
      data: heures,
    });
  } catch (error) {
    console.error("Erreur getAll heures :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};

// ─────────────────────────────────────────────
// getById
// Retourne UNE séance par son ID
// GET /api/heures/:id
// ─────────────────────────────────────────────
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const heure = await HeureEffectuee.findByPk(id, {
      include: [
        { model: Enseignant, as: "enseignant" },
        { model: Matiere, as: "matiere" },
        { model: AnneeAcademique, as: "annee" },
      ],
    });

    if (!heure) {
      return res.status(404).json({
        success: false,
        message: `Séance avec l'id ${id} introuvable.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: heure,
    });
  } catch (error) {
    console.error("Erreur getById heure :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};

// ─────────────────────────────────────────────
// getByEnseignant
// Retourne toutes les heures d'un enseignant
// avec pagination optionnelle
// GET /api/heures/enseignant/:id_enseignant
// ─────────────────────────────────────────────
const getByEnseignant = async (req, res) => {
  try {
    const { id_enseignant } = req.params;
    const { id_annee, type_heure } = req.query;

    const enseignant = await Enseignant.findByPk(id_enseignant);
    if (!enseignant) {
      return res.status(404).json({
        success: false,
        message: `Enseignant avec l'id ${id_enseignant} introuvable.`,
      });
    }

    const where = { id_enseignant };
    if (id_annee) where.id_annee = id_annee;
    if (type_heure) where.type_heure = type_heure;

    const heures = await HeureEffectuee.findAll({
      where,
      include: [
        {
          model: Matiere,
          as: "matiere",
          attributes: ["id", "intitule", "filiere", "niveau"],
        },
        { model: AnneeAcademique, as: "annee", attributes: ["id", "libelle"] },
      ],
      order: [["date_cours", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      enseignant: `${enseignant.nom} ${enseignant.prenom}`,
      total: heures.length,
      data: heures,
    });
  } catch (error) {
    console.error("Erreur getByEnseignant :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};

// ─────────────────────────────────────────────
// getByAnnee
// Retourne toutes les heures d'une année
// GET /api/heures/annee/:id_annee
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

    const heures = await HeureEffectuee.findAll({
      where: { id_annee },
      include: [
        {
          model: Enseignant,
          as: "enseignant",
          attributes: ["id", "nom", "prenom", "grade", "statut"],
        },
        {
          model: Matiere,
          as: "matiere",
          attributes: ["id", "intitule", "filiere", "niveau"],
        },
      ],
      order: [["date_cours", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      annee: annee.libelle,
      total: heures.length,
      data: heures,
    });
  } catch (error) {
    console.error("Erreur getByAnnee :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};

// ─────────────────────────────────────────────
// calculerTotaux (fonction utilitaire interne)
// Calcule les totaux pour un enseignant
// sur une année. Appelée par create et update
// pour détecter les dépassements
// ─────────────────────────────────────────────
const calculerTotauxInternes = async (id_enseignant, id_annee) => {
  // 1. Récupère toutes les heures de cet enseignant
  //    sur cette année
  const heures = await HeureEffectuee.findAll({
    where: { id_enseignant, id_annee },
  });

  // 2. Calcul par type
  const totalCM = heures
    .filter((h) => h.type_heure === "CM")
    .reduce((sum, h) => sum + parseFloat(h.duree), 0);
  const totalTD = heures
    .filter((h) => h.type_heure === "TD")
    .reduce((sum, h) => sum + parseFloat(h.duree), 0);
  const totalTP = heures
    .filter((h) => h.type_heure === "TP")
    .reduce((sum, h) => sum + parseFloat(h.duree), 0);

  const totalHeures = totalCM + totalTD + totalTP;

  // 3. Récupère le quota contractuel de l'enseignant
  const enseignant = await Enseignant.findByPk(id_enseignant);
  const annee = await AnneeAcademique.findByPk(id_annee);

  const quotaContractuel =
    enseignant.statut === "Permanent"
      ? parseFloat(annee.h_contract_permanent)
      : parseFloat(annee.h_contract_vacataire);

  const heuresComplementaires = Math.max(0, totalHeures - quotaContractuel);
  const heuresNormales = totalHeures - heuresComplementaires;
  const montantTotal =
    heuresComplementaires * parseFloat(enseignant.taux_horaire);

  return {
    totalCM,
    totalTD,
    totalTP,
    totalHeures,
    quotaContractuel,
    heuresNormales,
    heuresComplementaires,
    montantTotal,
    enDepassement: heuresComplementaires > 0,
  };
};

// ─────────────────────────────────────────────
// create
// Enregistre une nouvelle séance
// Vérifie le dépassement du seuil contractuel
// et retourne une alerte si nécessaire
// RH / Admin
// POST /api/heures
// ─────────────────────────────────────────────
const create = async (req, res) => {
  try {
    const {
      date_cours,
      type_heure,
      duree,
      salle,
      observations,
      id_enseignant,
      id_matiere,
      id_annee,
    } = req.body;

    // 1. Vérification des champs obligatoires
    if (
      !date_cours ||
      !type_heure ||
      !duree ||
      !id_enseignant ||
      !id_matiere ||
      !id_annee
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Date, type, durée, enseignant, matière et année sont obligatoires.",
      });
    }

    // 2. Vérification durée positive
    if (parseFloat(duree) <= 0) {
      return res.status(400).json({
        success: false,
        message: "La durée doit être supérieure à 0.",
      });
    }

    // 3. L'enseignant existe-t-il ?
    const enseignant = await Enseignant.findByPk(id_enseignant);
    if (!enseignant) {
      return res.status(404).json({
        success: false,
        message: `Enseignant introuvable.`,
      });
    }

    // 4. La matière existe-t-elle ?
    const matiere = await Matiere.findByPk(id_matiere);
    if (!matiere) {
      return res.status(404).json({
        success: false,
        message: `Matière introuvable.`,
      });
    }

    // 5. L'année existe-t-elle ?
    const annee = await AnneeAcademique.findByPk(id_annee);
    if (!annee) {
      return res.status(404).json({
        success: false,
        message: `Année académique introuvable.`,
      });
    }

    // 6. La date du cours est-elle dans la période
    //    de l'année académique ?
    const dateCours = new Date(date_cours);
    const dateDebut = new Date(annee.date_debut);
    const dateFin = new Date(annee.date_fin);

    if (dateCours < dateDebut || dateCours > dateFin) {
      return res.status(400).json({
        success: false,
        message: `La date du cours (${date_cours}) doit être dans la période de l'année ${annee.libelle} (${annee.date_debut} → ${annee.date_fin}).`,
      });
    }

    // 7. Calcul des totaux AVANT ajout
    //    pour détecter le dépassement
    const totauxAvant = await calculerTotauxInternes(id_enseignant, id_annee);

    // 8. Création de la séance
    const nouvelleHeure = await HeureEffectuee.create({
      date_cours,
      type_heure,
      duree: parseFloat(duree),
      salle: salle || null,
      observations: observations || null,
      id_enseignant,
      id_matiere,
      id_annee,
    });

    // 9. Calcul des totaux APRÈS ajout
    const totauxApres = await calculerTotauxInternes(id_enseignant, id_annee);

    // 10. Log de l'action
    await LogAction.create({
      action: `Saisie heure : ${enseignant.nom} ${enseignant.prenom} — ${type_heure} ${duree}h le ${date_cours}`,
      table_concernee: "heure_effectuees",
      id_utilisateur: req.utilisateur.id,
    });

    // 11. On retourne la séance créée + alerte si dépassement
    return res.status(201).json({
      success: true,
      message: "Séance enregistrée avec succès.",
      data: nouvelleHeure,
      alerte_depassement:
        totauxApres.enDepassement && !totauxAvant.enDepassement
          ? {
              type: "DEPASSEMENT",
              message: `⚠️ Attention : ${enseignant.nom} ${enseignant.prenom} a dépassé son quota contractuel de ${totauxApres.quotaContractuel}h. Heures complémentaires : ${totauxApres.heuresComplementaires}h.`,
            }
          : null,
      totaux: {
        total_heures: totauxApres.totalHeures,
        quota_contractuel: totauxApres.quotaContractuel,
        heures_complementaires: totauxApres.heuresComplementaires,
        montant_estime: totauxApres.montantTotal,
        en_depassement: totauxApres.enDepassement,
      },
    });
  } catch (error) {
    console.error("Erreur create heure :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};

// ─────────────────────────────────────────────
// update
// Modifie une séance existante
// RH / Admin
// PUT /api/heures/:id
// ─────────────────────────────────────────────
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { date_cours, type_heure, duree, salle, observations } = req.body;

    const heure = await HeureEffectuee.findByPk(id);
    if (!heure) {
      return res.status(404).json({
        success: false,
        message: `Séance avec l'id ${id} introuvable.`,
      });
    }

    // Vérification durée si fournie
    if (duree && parseFloat(duree) <= 0) {
      return res.status(400).json({
        success: false,
        message: "La durée doit être supérieure à 0.",
      });
    }

    await heure.update({
      date_cours: date_cours || heure.date_cours,
      type_heure: type_heure || heure.type_heure,
      duree: duree ? parseFloat(duree) : heure.duree,
      salle: salle ?? heure.salle,
      observations: observations ?? heure.observations,
    });

    // Recalcul des totaux après modification
    const totaux = await calculerTotauxInternes(
      heure.id_enseignant,
      heure.id_annee,
    );

    await LogAction.create({
      action: `Modification séance id:${id}`,
      table_concernee: "heure_effectuees",
      id_utilisateur: req.utilisateur.id,
    });

    return res.status(200).json({
      success: true,
      message: "Séance modifiée avec succès.",
      data: heure,
      totaux: {
        total_heures: totaux.totalHeures,
        heures_complementaires: totaux.heuresComplementaires,
        montant_estime: totaux.montantTotal,
        en_depassement: totaux.enDepassement,
      },
    });
  } catch (error) {
    console.error("Erreur update heure :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};

// ─────────────────────────────────────────────
// deleteHeure
// Supprime une séance
// RH / Admin
// DELETE /api/heures/:id
// ─────────────────────────────────────────────
const deleteHeure = async (req, res) => {
  try {
    const { id } = req.params;

    const heure = await HeureEffectuee.findByPk(id, {
      include: [{ model: Enseignant, as: "enseignant" }],
    });

    if (!heure) {
      return res.status(404).json({
        success: false,
        message: `Séance avec l'id ${id} introuvable.`,
      });
    }

    const info = `${heure.type_heure} ${heure.duree}h le ${heure.date_cours}`;
    const { id_enseignant, id_annee } = heure;

    await heure.destroy();

    // Recalcul après suppression
    const totaux = await calculerTotauxInternes(id_enseignant, id_annee);

    await LogAction.create({
      action: `Suppression séance : ${info}`,
      table_concernee: "heure_effectuees",
      id_utilisateur: req.utilisateur.id,
    });

    return res.status(200).json({
      success: true,
      message: `Séance supprimée avec succès.`,
      totaux: {
        total_heures: totaux.totalHeures,
        heures_complementaires: totaux.heuresComplementaires,
        montant_estime: totaux.montantTotal,
      },
    });
  } catch (error) {
    console.error("Erreur delete heure :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};

// ─────────────────────────────────────────────
// calculerTotaux
// Route publique qui expose le calcul complet
// GET /api/heures/totaux/:id_enseignant?id_annee=1
// ─────────────────────────────────────────────
const calculerTotaux = async (req, res) => {
  try {
    const { id_enseignant } = req.params;
    const { id_annee } = req.query;

    if (!id_annee) {
      return res.status(400).json({
        success: false,
        message: "Le paramètre id_annee est obligatoire.",
      });
    }

    const enseignant = await Enseignant.findByPk(id_enseignant, {
      include: [{ model: Departement, as: "departement" }],
    });

    if (!enseignant) {
      return res.status(404).json({
        success: false,
        message: `Enseignant introuvable.`,
      });
    }

    const totaux = await calculerTotauxInternes(id_enseignant, id_annee);

    return res.status(200).json({
      success: true,
      data: {
        enseignant: {
          id: enseignant.id,
          nom: enseignant.nom,
          prenom: enseignant.prenom,
          statut: enseignant.statut,
          taux_horaire: enseignant.taux_horaire,
        },
        totaux: {
          total_CM: parseFloat(totaux.totalCM.toFixed(2)),
          total_TD: parseFloat(totaux.totalTD.toFixed(2)),
          total_TP: parseFloat(totaux.totalTP.toFixed(2)),
          total_heures: parseFloat(totaux.totalHeures.toFixed(2)),
          quota_contractuel: parseFloat(totaux.quotaContractuel.toFixed(2)),
          heures_normales: parseFloat(totaux.heuresNormales.toFixed(2)),
          heures_complementaires: parseFloat(
            totaux.heuresComplementaires.toFixed(2),
          ),
          montant_total: parseFloat(totaux.montantTotal.toFixed(2)),
          en_depassement: totaux.enDepassement,
        },
      },
    });
  } catch (error) {
    console.error("Erreur calculerTotaux :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};

// ─────────────────────────────────────────────
// verifierDepassement
// Vérifie si un enseignant dépasse son quota
// Retourne une alerte claire si oui
// GET /api/heures/depassement/:id_enseignant?id_annee=1
// ─────────────────────────────────────────────
const verifierDepassement = async (req, res) => {
  try {
    const { id_enseignant } = req.params;
    const { id_annee } = req.query;

    if (!id_annee) {
      return res.status(400).json({
        success: false,
        message: "Le paramètre id_annee est obligatoire.",
      });
    }

    const enseignant = await Enseignant.findByPk(id_enseignant);
    if (!enseignant) {
      return res.status(404).json({
        success: false,
        message: `Enseignant introuvable.`,
      });
    }

    const totaux = await calculerTotauxInternes(id_enseignant, id_annee);

    return res.status(200).json({
      success: true,
      data: {
        enseignant: `${enseignant.nom} ${enseignant.prenom}`,
        en_depassement: totaux.enDepassement,
        total_heures: totaux.totalHeures,
        quota_contractuel: totaux.quotaContractuel,
        heures_complementaires: totaux.heuresComplementaires,
        montant_a_payer: totaux.montantTotal,
        // Pourcentage du quota utilisé
        taux_utilisation:
          totaux.quotaContractuel > 0
            ? parseFloat(
                ((totaux.totalHeures / totaux.quotaContractuel) * 100).toFixed(
                  1,
                ),
              )
            : 0,
      },
    });
  } catch (error) {
    console.error("Erreur verifierDepassement :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};

module.exports = {
  getAll,
  getById,
  getByEnseignant,
  getByAnnee,
  create,
  update,
  delete: deleteHeure,
  calculerTotaux,
  verifierDepassement,
};