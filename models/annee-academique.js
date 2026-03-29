'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AnneeAcademique extends Model {

    static associate(models) {
      // 🔗 une année a plusieurs heures effectuées
      AnneeAcademique.hasMany(models.HeureEffectuee, {
        foreignKey: 'ID_Annee'
      });

      // 🔗 une année a plusieurs paramètres d'équivalence
      AnneeAcademique.hasMany(models.ParametreEquivalence, {
        foreignKey: 'ID_Annee'
      });
    }

  }

  AnneeAcademique.init({
    ID_Annee: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Libelle: DataTypes.STRING,
    Date_Debut: DataTypes.DATE,
    Date_Fin: DataTypes.DATE,
    Heures_Contractuelles_Permanents: DataTypes.INTEGER,
    Heures_Contractuelles_Vacataires: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'AnneeAcademique',   // ✅ côté code
    tableName: 'ANNEE_ACADEMIQUE'   // ✅ côté base
  });

  return AnneeAcademique;
};