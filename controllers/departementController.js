const { Departement, Enseignant, Matiere } = require('../models');
const { LogAction } = require('../models');

// ─────────────────────────────────────────────
// getAll
// Retourne la liste de tous les départements
// avec le nombre d'enseignants et de matières
// GET /api/departements
// ─────────────────────────────────────────────
const getAll = async (req, res) => {
  try {
    const departements = await Departement.findAll({
      // include = jointure avec d'autres tables
      // comme un JOIN en SQL
      include: [
        {
          model: Enseignant,
          as: 'enseignants',
          // On ne prend que l'id pour juste compter
          attributes: ['id']
        },
        {
          model: Matiere,
          as: 'matieres',
          attributes: ['id']
        }
      ],
      // Trie par ordre alphabétique
      order: [['nom_departement', 'ASC']]
    });

    // On formate la réponse pour ajouter les compteurs
    const data = departements.map(dep => ({
      id:               dep.id,
      nom_departement:  dep.nom_departement,
      // .length compte le nombre d'éléments
      nb_enseignants:   dep.enseignants.length,
      nb_matieres:      dep.matieres.length,
      createdAt:        dep.createdAt,
      updatedAt:        dep.updatedAt
    }));

    return res.status(200).json({
      success: true,
      // data.length = nombre total de départements
      total: data.length,
      data
    });

  } catch (error) {
    console.error('Erreur getAll départements :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
};

// ─────────────────────────────────────────────
// getById
// Retourne UN département avec ses enseignants
// et ses matières
// GET /api/departements/:id
// ─────────────────────────────────────────────
const getById = async (req, res) => {
  try {
    // req.params.id = l'id dans l'URL
    // ex : /api/departements/3 → id = 3
    const { id } = req.params;

    const departement = await Departement.findByPk(id, {
      include: [
        {
          model: Enseignant,
          as: 'enseignants',
          // On prend ces colonnes de l'enseignant
          attributes: ['id', 'nom', 'prenom', 'grade', 'statut']
        },
        {
          model: Matiere,
          as: 'matieres',
          attributes: ['id', 'intitule', 'niveau', 'filiere']
        }
      ]
    });

    // Si l'id n'existe pas dans la BDD
    if (!departement) {
      return res.status(404).json({
        success: false,
        message: `Département avec l'id ${id} introuvable.`
      });
    }

    return res.status(200).json({
      success: true,
      data: departement
    });

  } catch (error) {
    console.error('Erreur getById département :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
};

// ─────────────────────────────────────────────
// create
// Crée un nouveau département
// Admin uniquement
// POST /api/departements
// ─────────────────────────────────────────────
const create = async (req, res) => {
  try {
    // On récupère le nom envoyé par le front
    const { nom_departement } = req.body;

    // 1. Vérification : champ obligatoire
    if (!nom_departement || nom_departement.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Le nom du département est obligatoire.'
      });
    }

    // 2. Vérification : le département existe déjà ?
    //    findOne cherche UN enregistrement
    const existeDeja = await Departement.findOne({
      where: { nom_departement: nom_departement.trim() }
    });

    if (existeDeja) {
      return res.status(409).json({
        // 409 = Conflict
        success: false,
        message: `Le département "${nom_departement}" existe déjà.`
      });
    }

    // 3. Création dans la BDD
    const nouveauDepartement = await Departement.create({
      nom_departement: nom_departement.trim()
    });

    // 4. On enregistre l'action dans les logs
    await LogAction.create({
      action:          `Création du département : ${nom_departement}`,
      table_concernee: 'departements',
      id_utilisateur:  req.utilisateur.id
      // req.utilisateur.id vient du middleware verifierToken
    });

    return res.status(201).json({
      // 201 = Created
      success: true,
      message: 'Département créé avec succès.',
      data: nouveauDepartement
    });

  } catch (error) {
    console.error('Erreur create département :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
};

// ─────────────────────────────────────────────
// update
// Modifie le nom d'un département existant
// Admin uniquement
// PUT /api/departements/:id
// ─────────────────────────────────────────────
const update = async (req, res) => {
  try {
    const { id }              = req.params;
    const { nom_departement } = req.body;

    // 1. Vérification : champ obligatoire
    if (!nom_departement || nom_departement.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Le nom du département est obligatoire.'
      });
    }

    // 2. Le département à modifier existe-t-il ?
    const departement = await Departement.findByPk(id);

    if (!departement) {
      return res.status(404).json({
        success: false,
        message: `Département avec l'id ${id} introuvable.`
      });
    }

    // 3. Le nouveau nom est-il déjà pris
    //    par un AUTRE département ?
    const existeDeja = await Departement.findOne({
      where: { nom_departement: nom_departement.trim() }
    });

    // Si le nom existe ET c'est un autre département
    if (existeDeja && existeDeja.id !== parseInt(id)) {
      return res.status(409).json({
        success: false,
        message: `Le nom "${nom_departement}" est déjà utilisé.`
      });
    }

    // 4. Sauvegarde de l'ancien nom pour le log
    const ancienNom = departement.nom_departement;

    // 5. Mise à jour
    await departement.update({
      nom_departement: nom_departement.trim()
    });

    // 6. Log de l'action
    await LogAction.create({
      action:          `Modification département : "${ancienNom}" → "${nom_departement}"`,
      table_concernee: 'departements',
      id_utilisateur:  req.utilisateur.id
    });

    return res.status(200).json({
      success: true,
      message: 'Département modifié avec succès.',
      data: departement
    });

  } catch (error) {
    console.error('Erreur update département :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
};

// ─────────────────────────────────────────────
// delete
// Supprime un département
// Impossible si des enseignants ou matières
// y sont encore rattachés
// Admin uniquement
// DELETE /api/departements/:id
// ─────────────────────────────────────────────
const deleteDepartement = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Le département existe-t-il ?
    const departement = await Departement.findByPk(id, {
      include: [
        { model: Enseignant, as: 'enseignants', attributes: ['id'] },
        { model: Matiere,    as: 'matieres',    attributes: ['id'] }
      ]
    });

    if (!departement) {
      return res.status(404).json({
        success: false,
        message: `Département avec l'id ${id} introuvable.`
      });
    }

    // 2. Vérification : des enseignants sont-ils
    //    encore rattachés à ce département ?
    if (departement.enseignants.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer. ${departement.enseignants.length} enseignant(s) sont rattachés à ce département.`
      });
    }

    // 3. Vérification : des matières sont-elles
    //    encore rattachées à ce département ?
    if (departement.matieres.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer. ${departement.matieres.length} matière(s) sont rattachées à ce département.`
      });
    }

    // 4. Sauvegarde du nom pour le log
    const nomSupprime = departement.nom_departement;

    // 5. Suppression
    await departement.destroy();

    // 6. Log de l'action
    await LogAction.create({
      action:          `Suppression du département : ${nomSupprime}`,
      table_concernee: 'departements',
      id_utilisateur:  req.utilisateur.id
    });

    return res.status(200).json({
      success: true,
      message: `Département "${nomSupprime}" supprimé avec succès.`
    });

  } catch (error) {
    console.error('Erreur delete département :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteDepartement
};