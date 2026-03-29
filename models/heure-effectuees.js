'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HeureEffectuee extends Model {

    static associate(models) {
      // 🔗 appartient à un enseignant
      HeureEffectuee.belongsTo(models.Enseignant, {
        foreignKey: 'ID_Enseignant'
      });

      // 🔗 appartient à une matière
      HeureEffectuee.belongsTo(models.Matiere, {
        foreignKey: 'ID_Matiere'
      });

      // 🔗 appartient à une année académique
      HeureEffectuee.belongsTo(models.AnneeAcademique, {
        foreignKey: 'ID_Annee'
      });
    }

  }

  HeureEffectuee.init({
    ID_Heure: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Date_Cours: DataTypes.DATE,
    Type_Heure: DataTypes.STRING,
    Duree: DataTypes.FLOAT,
    Salle: DataTypes.STRING,
    Observations: DataTypes.TEXT,
    ID_Enseignant: DataTypes.INTEGER,
    ID_Matiere: DataTypes.INTEGER,
    ID_Annee: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'HeureEffectuee',   // ✅ côté code
    tableName: 'HEURE_EFFECTUEES'  // ✅ côté base
  });

  return HeureEffectuee;
};