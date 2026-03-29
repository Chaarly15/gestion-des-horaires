'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ParametreEquivalence extends Model {

    static associate(models) {
      // 🔗 appartient à une année académique
      ParametreEquivalence.belongsTo(models.AnneeAcademique, {
        foreignKey: 'ID_Annee'
      });
    }

  }

  ParametreEquivalence.init({
    ID_Parametre: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Type_Source: DataTypes.STRING,
    Type_Cible: DataTypes.STRING,
    Coefficient: DataTypes.FLOAT,
    ID_Annee: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ParametreEquivalence',   // ✅ côté code
    tableName: 'PARAMETRE_EQUIVALENCES'  // ✅ côté base
  });

  return ParametreEquivalence;
};