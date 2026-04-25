const { LogAction, Utilisateur } = require('../models');
const { Op } = require('sequelize');

const getAll = async (req, res) => {
  try {
    const { id_utilisateur, table_concernee, limit = 100 } = req.query;
    const where = {};
    if (id_utilisateur)   where.id_utilisateur   = id_utilisateur;
    if (table_concernee)  where.table_concernee  = table_concernee;

    const logs = await LogAction.findAll({
      where,
      include: [{
        model: Utilisateur,
        as: 'utilisateur',
        attributes: ['id', 'login', 'role']
      }],
      order: [['date_action', 'DESC']],
      limit: parseInt(limit)
    });

    return res.status(200).json({
      success: true,
      total: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Erreur getAll logs :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

const getByUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;

    const logs = await LogAction.findAll({
      where: { id_utilisateur: id },
      include: [{
        model: Utilisateur,
        as: 'utilisateur',
        attributes: ['id', 'login', 'role']
      }],
      order: [['date_action', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      total: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Erreur getByUtilisateur logs :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

const deleteLogs = async (req, res) => {
  try {
    // Supprime les logs de plus de 30 jours
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - 30);

    const nb = await LogAction.destroy({
      where: {
        date_action: { [Op.lt]: dateLimit }
      }
    });

    return res.status(200).json({
      success: true,
      message: `${nb} log(s) supprimé(s) avec succès.`
    });
  } catch (error) {
    console.error('Erreur deleteLogs :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

module.exports = { getAll, getByUtilisateur, delete: deleteLogs };