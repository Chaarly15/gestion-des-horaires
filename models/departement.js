'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DEPARTEMENT extends Model {
    static associate(models) {
      // 1️⃣ Un département a plusieurs enseignants
      DEPARTEMENT.hasMany(models.ENSEIGNANT, {
        foreignKey: 'ID_Departement'
      });

      // 2️⃣ Un département a plusieurs matières
      DEPARTEMENT.hasMany(models.MATIERE, {
        foreignKey: 'ID_Departement'
      });
    }
  }

  DEPARTEMENT.init({
    ID_Departement: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Nom_Departement: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'DEPARTEMENT',
    tableName: 'DEPARTEMENT' // optionnel mais recommandé pour garder le nom SQL
  });

  return DEPARTEMENT;
};