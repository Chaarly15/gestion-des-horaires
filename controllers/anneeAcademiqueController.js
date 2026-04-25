const { Op } = require('sequelize');
const { AnneeAcademique, HeureEffectuee, ParametreEquivalence } = require('../models');
const { LogAction } = require('../models');

const getAll = async (req, res) => {
  try {
    const annees = await AnneeAcademique.findAll({
      order: [['date_debut', 'DESC']]
    });
    return res.status(200).json({ success: true, total: annees.length, data: annees });
  } catch (error) {
    console.error('Erreur getAll années :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const annee = await AnneeAcademique.findByPk(id);
    if (!annee) {
      return res.status(404).json({ success: false, message: `Année académique avec l'id ${id} introuvable.` });
    }
    return res.status(200).json({ success: true, data: annee });
  } catch (error) {
    console.error('Erreur getById année :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

const getCurrent = async (req, res) => {
  try {
    const today = new Date();
    const annee = await AnneeAcademique.findOne({
      where: {
        date_debut: { [Op.lte]: today },
        date_fin: { [Op.gte]: today }
      }
    });
    if (!annee) {
      return res.status(404).json({ success: false, message: 'Aucune année académique en cours trouvée.' });
    }
    return res.status(200).json({ success: true, data: annee });
  } catch (error) {
    console.error('Erreur getCurrent année :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

const create = async (req, res) => {
  try {
    const { libelle, date_debut, date_fin, h_contract_permanent, h_contract_vacataire } = req.body;

    if (!libelle || !date_debut || !date_fin) {
      return res.status(400).json({ success: false, message: 'Libellé, date de début et date de fin sont obligatoires.' });
    }

    if (new Date(date_fin) <= new Date(date_debut)) {
      return res.status(400).json({ success: false, message: 'La date de fin doit être postérieure à la date de début.' });
    }

    const existeDeja = await AnneeAcademique.findOne({ where: { libelle: libelle.trim() } });
    if (existeDeja) {
      return res.status(409).json({ success: false, message: `L'année académique "${libelle}" existe déjà.` });
    }

    const chevauchement = await AnneeAcademique.findOne({
      where: {
        [Op.or]: [
          { date_debut: { [Op.between]: [date_debut, date_fin] } },
          { date_fin: { [Op.between]: [date_debut, date_fin] } },
          { date_debut: { [Op.lte]: date_debut }, date_fin: { [Op.gte]: date_fin } }
        ]
      }
    });

    if (chevauchement) {
      return res.status(409).json({
        success: false,
        message: `Les dates se chevauchent avec l'année "${chevauchement.libelle}" (${chevauchement.date_debut} → ${chevauchement.date_fin}).`
      });
    }

    const nouvelleAnnee = await AnneeAcademique.create({
      libelle: libelle.trim(),
      date_debut,
      date_fin,
      h_contract_permanent: h_contract_permanent || 0,
      h_contract_vacataire: h_contract_vacataire || 0
    });

    await LogAction.create({
      action: `Création de l'année académique : ${libelle}`,
      table_concernee: 'annee_academiques',
      id_utilisateur: req.utilisateur.id
    });

    return res.status(201).json({ success: true, message: 'Année académique créée avec succès.', data: nouvelleAnnee });

  } catch (error) {
    console.error('Erreur create année :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { libelle, date_debut, date_fin, h_contract_permanent, h_contract_vacataire } = req.body;

    // 1. L'année existe-t-elle ?
    const annee = await AnneeAcademique.findByPk(id);
    if (!annee) {
      return res.status(404).json({ success: false, message: `Année académique avec l'id ${id} introuvable.` });
    }

    const newDebut = date_debut || annee.date_debut;
    const newFin = date_fin || annee.date_fin;

    console.log('DEBUG newDebut:', newDebut, '| newFin:', newFin);

    // 2. Vérification date_fin > date_debut
    if (new Date(newFin) <= new Date(newDebut)) {
      return res.status(400).json({ success: false, message: 'La date de fin doit être postérieure à la date de début.' });
    }

    // 3. Vérification doublon libellé
    if (libelle) {
      const existeDeja = await AnneeAcademique.findOne({
        where: { libelle: libelle.trim() }
      });

      console.log('DEBUG existeDeja.id:', existeDeja?.id, '| parseInt(id):', parseInt(id));

      if (existeDeja && parseInt(existeDeja.id) !== parseInt(id)) {
        return res.status(409).json({
          success: false,
          message: `Le libellé "${libelle}" est déjà utilisé par une autre année.`
        });
      }
    }

    // 4. Vérification chevauchement
    console.log('DEBUG avant chevauchement query...');

    const chevauchement = await AnneeAcademique.findOne({
      where: {
        id: { [Op.ne]: parseInt(id) },
        [Op.or]: [
          { date_debut: { [Op.between]: [newDebut, newFin] } },
          { date_fin: { [Op.between]: [newDebut, newFin] } },
          { date_debut: { [Op.lte]: newDebut }, date_fin: { [Op.gte]: newFin } }
        ]
      }
    });

    console.log('DEBUG chevauchement:', chevauchement?.libelle || 'aucun');

    if (chevauchement) {
      return res.status(409).json({
        success: false,
        message: `Les dates se chevauchent avec l'année "${chevauchement.libelle}" (${chevauchement.date_debut} → ${chevauchement.date_fin}).`
      });
    }

    // 5. Sauvegarde ancienne valeur pour le log
    const ancienLibelle = annee.libelle;

    // 6. Mise à jour
    console.log('DEBUG avant annee.update...');

    await annee.update({
      libelle: libelle ? libelle.trim() : annee.libelle,
      date_debut: date_debut || annee.date_debut,
      date_fin: date_fin || annee.date_fin,
      h_contract_permanent: h_contract_permanent ?? annee.h_contract_permanent,
      h_contract_vacataire: h_contract_vacataire ?? annee.h_contract_vacataire
    });

    console.log('DEBUG après annee.update, avant LogAction...');

    // 7. Log
    await LogAction.create({
      action: `Modification année académique : "${ancienLibelle}" → "${annee.libelle}"`,
      table_concernee: 'annee_academiques',
      id_utilisateur: req.utilisateur.id
    });

    console.log('DEBUG LogAction créé, envoi réponse...');

    return res.status(200).json({ success: true, message: 'Année académique modifiée avec succès.', data: annee });

  } catch (error) {
    console.error('Erreur update année :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

const deleteAnnee = async (req, res) => {
  try {
    const { id } = req.params;

    const annee = await AnneeAcademique.findByPk(id);
    if (!annee) {
      return res.status(404).json({ success: false, message: `Année académique avec l'id ${id} introuvable.` });
    }

    const nbHeures = await HeureEffectuee.count({ where: { id_annee: id } });
    if (nbHeures > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer. ${nbHeures} heure(s) effectuée(s) sont rattachées à cette année.`
      });
    }

    const nbParams = await ParametreEquivalence.count({ where: { id_annee: id } });
    if (nbParams > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer. ${nbParams} paramètre(s) d'équivalence sont rattachés à cette année.`
      });
    }

    const libelleSupp = annee.libelle;
    await annee.destroy();

    await LogAction.create({
      action: `Suppression de l'année académique : ${libelleSupp}`,
      table_concernee: 'annee_academiques',
      id_utilisateur: req.utilisateur.id
    });

    return res.status(200).json({ success: true, message: `Année académique "${libelleSupp}" supprimée avec succès.` });

  } catch (error) {
    console.error('Erreur delete année :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

module.exports = { getAll, getById, getCurrent, create, update, delete: deleteAnnee };