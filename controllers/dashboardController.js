const {
  Enseignant,
  HeureEffectuee,
  Departement,
  AnneeAcademique,
  Utilisateur,
} = require("../models");
const { Op, fn, col, literal } = require("sequelize");

// ─────────────────────────────────────────────
// getStats
// Retourne les 4 KPI principaux du tableau
// de bord pour une année académique donnée
// GET /api/dashboard/stats?id_annee=1
// ─────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const { id_annee } = req.query;

    // 1. Total enseignants (toutes années)
    const totalEnseignants = await Enseignant.count();

    // 2. Filtrer les heures selon l'année si fournie
    const whereHeures = id_annee ? { id_annee } : {};

    // 3. Total heures effectuées
    //    fn('SUM', col('duree')) = SUM(duree) en SQL
    const resultHeures = await HeureEffectuee.findOne({
      where: whereHeures,
      attributes: [[fn("SUM", col("duree")), "total_heures"]],
      raw: true, // retourne un objet simple, pas une instance Sequelize
    });
    const totalHeures = parseFloat(resultHeures?.total_heures || 0);

    // 4. Calcul des enseignants en dépassement
    //    On récupère tous les enseignants et on calcule
    //    leurs heures pour trouver les dépassements
    let nbDepassements = 0;
    let montantTotal = 0;

    if (id_annee) {
      const annee = await AnneeAcademique.findByPk(id_annee);
      const enseignants = await Enseignant.findAll();

      for (const ens of enseignants) {
        // Somme des heures de cet enseignant sur cette année
        const result = await HeureEffectuee.findOne({
          where: { id_enseignant: ens.id, id_annee },
          attributes: [[fn("SUM", col("duree")), "total"]],
          raw: true,
        });

        const totalEns = parseFloat(result?.total || 0);
        const quota =
          ens.statut === "Permanent"
            ? parseFloat(annee.h_contract_permanent)
            : parseFloat(annee.h_contract_vacataire);

        const complementaires = Math.max(0, totalEns - quota);
        if (complementaires > 0) {
          nbDepassements++;
          montantTotal += complementaires * parseFloat(ens.taux_horaire);
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        total_enseignants: totalEnseignants,
        total_heures: parseFloat(totalHeures.toFixed(2)),
        nb_depassements: nbDepassements,
        montant_total: parseFloat(montantTotal.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Erreur getStats :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// ─────────────────────────────────────────────
// getHeuresParDepartement
// Retourne le total des heures groupé par
// département — pour le graphique en barres
// GET /api/dashboard/heures-par-departement?id_annee=1
// ─────────────────────────────────────────────
const getHeuresParDepartement = async (req, res) => {
  try {
    const { id_annee } = req.query;
    const whereHeures = id_annee ? { id_annee } : {};

    // On récupère tous les départements
    const departements = await Departement.findAll({
      order: [["nom_departement", "ASC"]],
    });

    // Pour chaque département, on calcule les heures
    // de tous ses enseignants
    const data = await Promise.all(
      departements.map(async (dept) => {
        // Trouve tous les enseignants du département
        const enseignants = await Enseignant.findAll({
          where: { id_departement: dept.id },
          attributes: ["id"],
        });

        const ids = enseignants.map((e) => e.id);
        if (ids.length === 0) {
          return { departement: dept.nom_departement, total_heures: 0 };
        }

        // Somme des heures de tous ces enseignants
        const result = await HeureEffectuee.findOne({
          where: {
            ...whereHeures,
            id_enseignant: { [Op.in]: ids },
          },
          attributes: [[fn("SUM", col("duree")), "total"]],
          raw: true,
        });

        return {
          departement: dept.nom_departement,
          total_heures: parseFloat(result?.total || 0),
        };
      }),
    );

    // On trie du plus grand au plus petit
    data.sort((a, b) => b.total_heures - a.total_heures);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Erreur getHeuresParDepartement :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// ─────────────────────────────────────────────
// getRepartitionCMTDTP
// Retourne la répartition CM/TD/TP en heures
// et en pourcentage — pour le camembert
// GET /api/dashboard/repartition?id_annee=1
// ─────────────────────────────────────────────
const getRepartitionCMTDTP = async (req, res) => {
  try {
    const { id_annee } = req.query;
    const where = id_annee ? { id_annee } : {};

    const types = ["CM", "TD", "TP"];
    const repartition = {};

    let totalGeneral = 0;

    // Pour chaque type, on fait un SUM
    for (const type of types) {
      const result = await HeureEffectuee.findOne({
        where: { ...where, type_heure: type },
        attributes: [[fn("SUM", col("duree")), "total"]],
        raw: true,
      });
      repartition[type] = parseFloat(result?.total || 0);
      totalGeneral += repartition[type];
    }

    // Calcul des pourcentages
    const data = types.map((type) => ({
      type,
      heures: repartition[type],
      pourcentage:
        totalGeneral > 0
          ? parseFloat(((repartition[type] / totalGeneral) * 100).toFixed(1))
          : 0,
    }));

    return res.status(200).json({
      success: true,
      total_heures: totalGeneral,
      data,
    });
  } catch (error) {
    console.error("Erreur getRepartitionCMTDTP :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// ─────────────────────────────────────────────
// getTopEnseignants
// Retourne le top 5 des enseignants avec le
// plus d'heures effectuées
// GET /api/dashboard/top-enseignants?id_annee=1
// ─────────────────────────────────────────────
const getTopEnseignants = async (req, res) => {
  try {
    const { id_annee, limit = 5 } = req.query;
    const whereHeures = id_annee ? { id_annee } : {};

    const enseignants = await Enseignant.findAll({
      include: [
        {
          model: Departement,
          as: "departement",
          attributes: ["nom_departement"],
        },
      ],
    });

    // Pour chaque enseignant, on calcule ses heures
    const data = await Promise.all(
      enseignants.map(async (ens) => {
        const result = await HeureEffectuee.findOne({
          where: { ...whereHeures, id_enseignant: ens.id },
          attributes: [[fn("SUM", col("duree")), "total"]],
          raw: true,
        });

        return {
          id: ens.id,
          nom: ens.nom,
          prenom: ens.prenom,
          grade: ens.grade,
          statut: ens.statut,
          departement: ens.departement?.nom_departement,
          total_heures: parseFloat(result?.total || 0),
        };
      }),
    );

    // Trie décroissant et on prend les N premiers
    const top = data
      .sort((a, b) => b.total_heures - a.total_heures)
      .slice(0, parseInt(limit));

    return res.status(200).json({
      success: true,
      data: top,
    });
  } catch (error) {
    console.error("Erreur getTopEnseignants :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// ─────────────────────────────────────────────
// getEnseignantsEnDepassement
// Retourne la liste complète des enseignants
// qui ont dépassé leur quota contractuel
// GET /api/dashboard/depassements?id_annee=1
// ─────────────────────────────────────────────
const getEnseignantsEnDepassement = async (req, res) => {
  try {
    const { id_annee } = req.query;

    if (!id_annee) {
      return res.status(400).json({
        success: false,
        message: "Le paramètre id_annee est obligatoire.",
      });
    }

    const annee = await AnneeAcademique.findByPk(id_annee);
    const enseignants = await Enseignant.findAll({
      include: [{ model: Departement, as: "departement" }],
    });

    const depassements = [];

    for (const ens of enseignants) {
      const result = await HeureEffectuee.findOne({
        where: { id_enseignant: ens.id, id_annee },
        attributes: [[fn("SUM", col("duree")), "total"]],
        raw: true,
      });

      const totalHeures = parseFloat(result?.total || 0);
      const quota =
        ens.statut === "Permanent"
          ? parseFloat(annee.h_contract_permanent)
          : parseFloat(annee.h_contract_vacataire);

      const complementaires = Math.max(0, totalHeures - quota);

      if (complementaires > 0) {
        depassements.push({
          id: ens.id,
          nom: ens.nom,
          prenom: ens.prenom,
          grade: ens.grade,
          statut: ens.statut,
          departement: ens.departement?.nom_departement,
          taux_horaire: ens.taux_horaire,
          quota_contractuel: quota,
          total_heures: totalHeures,
          heures_complementaires: complementaires,
          montant_a_payer: parseFloat(
            (complementaires * ens.taux_horaire).toFixed(2),
          ),
        });
      }
    }

    // Trie par montant décroissant
    depassements.sort((a, b) => b.montant_a_payer - a.montant_a_payer);

    return res.status(200).json({
      success: true,
      annee: annee.libelle,
      total: depassements.length,
      data: depassements,
    });
  } catch (error) {
    console.error("Erreur getEnseignantsEnDepassement :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

module.exports = {
  getStats,
  getHeuresParDepartement,
  getRepartitionCMTDTP,
  getTopEnseignants,
  getEnseignantsEnDepassement,
};
