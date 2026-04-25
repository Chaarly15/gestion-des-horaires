const { Matiere, Departement, HeureEffectuee } = require('../models');
const { LogAction } = require('../models');

// ─────────────────────────────────────────────
// getAll
// Retourne toutes les matières avec leur
// département. Filtrable par filière et niveau
// GET /api/matieres
// ─────────────────────────────────────────────
const getAll = async (req, res) => {
  try {
    // Filtres optionnels dans l'URL
    // ex : /api/matieres?filiere=Informatique&niveau=L1
    const { filiere, niveau, id_departement } = req.query;

    const where = {};
    if (filiere)        where.filiere        = filiere;
    if (niveau)         where.niveau         = niveau;
    if (id_departement) where.id_departement = id_departement;

    const matieres = await Matiere.findAll({
      where,
      include: [{
        model: Departement,
        as: 'departement',
        attributes: ['id', 'nom_departement']
      }],
      order: [['intitule', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      total: matieres.length,
      data: matieres
    });

  } catch (error) {
    console.error('Erreur getAll matières :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
};

// ─────────────────────────────────────────────
// getById
// Retourne UNE matière avec son département
// et le nombre d'heures effectuées sur elle
// GET /api/matieres/:id
// ─────────────────────────────────────────────
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const matiere = await Matiere.findByPk(id, {
      include: [
        {
          model: Departement,
          as: 'departement',
          attributes: ['id', 'nom_departement']
        },
        {
          model: HeureEffectuee,
          as: 'heures',
          // On prend juste l'id pour compter
          attributes: ['id', 'type_heure', 'duree']
        }
      ]
    });

    if (!matiere) {
      return res.status(404).json({
        success: false,
        message: `Matière avec l'id ${id} introuvable.`
      });
    }

    // Calcul du total des heures effectuées
    // sur cette matière par type
    const totalCM = matiere.heures
      .filter(h => h.type_heure === 'CM')
      .reduce((sum, h) => sum + parseFloat(h.duree), 0);

    const totalTD = matiere.heures
      .filter(h => h.type_heure === 'TD')
      .reduce((sum, h) => sum + parseFloat(h.duree), 0);

    const totalTP = matiere.heures
      .filter(h => h.type_heure === 'TP')
      .reduce((sum, h) => sum + parseFloat(h.duree), 0);

    const totalEffectue = totalCM + totalTD + totalTP;

    // Calcul du taux de réalisation
    // (heures effectuées / volume prévu × 100)
    const tauxRealisation = matiere.volume_horaire_prevu > 0
      ? ((totalEffectue / matiere.volume_horaire_prevu) * 100).toFixed(1)
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        ...matiere.toJSON(),
        stats: {
          total_CM:           parseFloat(totalCM.toFixed(2)),
          total_TD:           parseFloat(totalTD.toFixed(2)),
          total_TP:           parseFloat(totalTP.toFixed(2)),
          total_effectue:     parseFloat(totalEffectue.toFixed(2)),
          volume_prevu:       parseFloat(matiere.volume_horaire_prevu),
          taux_realisation:   parseFloat(tauxRealisation)
        }
      }
    });

  } catch (error) {
    console.error('Erreur getById matière :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
};

// ─────────────────────────────────────────────
// getByDepartement
// Retourne toutes les matières d'un département
// GET /api/matieres/departement/:id_departement
// ─────────────────────────────────────────────
const getByDepartement = async (req, res) => {
  try {
    const { id_departement } = req.params;

    const dept = await Departement.findByPk(id_departement);
    if (!dept) {
      return res.status(404).json({
        success: false,
        message: `Département avec l'id ${id_departement} introuvable.`
      });
    }

    const matieres = await Matiere.findAll({
      where: { id_departement },
      include: [{
        model: Departement,
        as: 'departement',
        attributes: ['id', 'nom_departement']
      }],
      order: [['niveau', 'ASC'], ['intitule', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      departement: dept.nom_departement,
      total: matieres.length,
      data: matieres
    });

  } catch (error) {
    console.error('Erreur getByDepartement matières :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
};

// ─────────────────────────────────────────────
// getByFiliere
// Retourne les matières filtrées par filière
// GET /api/matieres/filiere/:filiere
// ─────────────────────────────────────────────
const getByFiliere = async (req, res) => {
  try {
    // decodeURIComponent gère les caractères
    // spéciaux dans l'URL (espaces, accents…)
    // ex : "G%C3%A9nie%20Logiciel" → "Génie Logiciel"
    const filiere = decodeURIComponent(req.params.filiere);

    const matieres = await Matiere.findAll({
      where: { filiere },
      include: [{
        model: Departement,
        as: 'departement',
        attributes: ['id', 'nom_departement']
      }],
      order: [['niveau', 'ASC'], ['intitule', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      filiere,
      total: matieres.length,
      data: matieres
    });

  } catch (error) {
    console.error('Erreur getByFiliere :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
};

// ─────────────────────────────────────────────
// getByNiveau
// Retourne les matières filtrées par niveau
// GET /api/matieres/niveau/:niveau
// ─────────────────────────────────────────────
const getByNiveau = async (req, res) => {
  try {
    const { niveau } = req.params;

    // Vérification que le niveau est valide
    const niveauxValides = ['L1', 'L2', 'L3', 'M1', 'M2'];
    if (!niveauxValides.includes(niveau)) {
      return res.status(400).json({
        success: false,
        message: `Niveau invalide. Valeurs acceptées : ${niveauxValides.join(', ')}`
      });
    }

    const matieres = await Matiere.findAll({
      where: { niveau },
      include: [{
        model: Departement,
        as: 'departement',
        attributes: ['id', 'nom_departement']
      }],
      order: [['filiere', 'ASC'], ['intitule', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      niveau,
      total: matieres.length,
      data: matieres
    });

  } catch (error) {
    console.error('Erreur getByNiveau :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
};

// ─────────────────────────────────────────────
// create
// Crée une nouvelle matière
// Admin / RH
// POST /api/matieres
// ─────────────────────────────────────────────
const create = async (req, res) => {
  try {
    const {
      intitule, filiere, niveau,
      volume_horaire_prevu, id_departement
    } = req.body;

    // 1. Vérification des champs obligatoires
    if (!intitule || !filiere || !niveau || !id_departement) {
      return res.status(400).json({
        success: false,
        message: 'Intitulé, filière, niveau et département sont obligatoires.'
      });
    }

    // 2. Le département existe-t-il ?
    const dept = await Departement.findByPk(id_departement);
    if (!dept) {
      return res.status(404).json({
        success: false,
        message: `Département avec l'id ${id_departement} introuvable.`
      });
    }

    // 3. Vérification doublon :
    //    même intitulé + même filière + même niveau
    const existeDeja = await Matiere.findOne({
      where: {
        intitule: intitule.trim(),
        filiere:  filiere.trim(),
        niveau
      }
    });

    if (existeDeja) {
      return res.status(409).json({
        success: false,
        message: `La matière "${intitule}" existe déjà pour la filière "${filiere}" en ${niveau}.`
      });
    }

    // 4. Création
    const nouvelleMatiere = await Matiere.create({
      intitule:            intitule.trim(),
      filiere:             filiere.trim(),
      niveau,
      volume_horaire_prevu: volume_horaire_prevu || 0,
      id_departement
    });

    // 5. Recharge avec département
    const result = await Matiere.findByPk(nouvelleMatiere.id, {
      include: [{ model: Departement, as: 'departement' }]
    });

    // 6. Log
    await LogAction.create({
      action:          `Création matière : ${intitule} (${filiere} - ${niveau})`,
      table_concernee: 'matieres',
      id_utilisateur:  req.utilisateur.id
    });

    return res.status(201).json({
      success: true,
      message: 'Matière créée avec succès.',
      data: result
    });

  } catch (error) {
    console.error('Erreur create matière :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
};

// ─────────────────────────────────────────────
// update
// Modifie une matière existante
// Admin / RH
// PUT /api/matieres/:id
// ─────────────────────────────────────────────
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      intitule, filiere, niveau,
      volume_horaire_prevu, id_departement
    } = req.body;

    // 1. La matière existe-t-elle ?
    const matiere = await Matiere.findByPk(id);
    if (!matiere) {
      return res.status(404).json({
        success: false,
        message: `Matière avec l'id ${id} introuvable.`
      });
    }

    // 2. Si on change de département, il doit exister
    if (id_departement) {
      const dept = await Departement.findByPk(id_departement);
      if (!dept) {
        return res.status(404).json({
          success: false,
          message: `Département avec l'id ${id_departement} introuvable.`
        });
      }
    }

    const ancienIntitule = matiere.intitule;

    // 3. Mise à jour partielle
    await matiere.update({
      intitule:             intitule ? intitule.trim() : matiere.intitule,
      filiere:              filiere  ? filiere.trim()  : matiere.filiere,
      niveau:               niveau               || matiere.niveau,
      volume_horaire_prevu: volume_horaire_prevu ?? matiere.volume_horaire_prevu,
      id_departement:       id_departement       || matiere.id_departement
    });

    // 4. Recharge avec département
    const result = await Matiere.findByPk(id, {
      include: [{ model: Departement, as: 'departement' }]
    });

    // 5. Log
    await LogAction.create({
      action:          `Modification matière : "${ancienIntitule}" → "${matiere.intitule}"`,
      table_concernee: 'matieres',
      id_utilisateur:  req.utilisateur.id
    });

    return res.status(200).json({
      success: true,
      message: 'Matière modifiée avec succès.',
      data: result
    });

  } catch (error) {
    console.error('Erreur update matière :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
};

// ─────────────────────────────────────────────
// deleteMatiere
// Supprime une matière
// Impossible si des heures lui sont rattachées
// Admin / RH
// DELETE /api/matieres/:id
// ─────────────────────────────────────────────
const deleteMatiere = async (req, res) => {
  try {
    const { id } = req.params;

    const matiere = await Matiere.findByPk(id);
    if (!matiere) {
      return res.status(404).json({
        success: false,
        message: `Matière avec l'id ${id} introuvable.`
      });
    }

    // Vérification : des heures sont-elles rattachées ?
    const nbHeures = await HeureEffectuee.count({
      where: { id_matiere: id }
    });

    if (nbHeures > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer. ${nbHeures} heure(s) effectuée(s) sont rattachées à cette matière.`
      });
    }

    const intituleSupp = matiere.intitule;
    await matiere.destroy();

    await LogAction.create({
      action:          `Suppression matière : ${intituleSupp}`,
      table_concernee: 'matieres',
      id_utilisateur:  req.utilisateur.id
    });

    return res.status(200).json({
      success: true,
      message: `Matière "${intituleSupp}" supprimée avec succès.`
    });

  } catch (error) {
    console.error('Erreur delete matière :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
};

module.exports = {
  getAll,
  getById,
  getByDepartement,
  getByFiliere,
  getByNiveau,
  create,
  update,
  delete: deleteMatiere
};