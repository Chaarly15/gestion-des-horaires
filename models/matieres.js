'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Matiere extends Model {

    static associate(models) {
      // 🔗 appartient à un département
      Matiere.belongsTo(models.Departement, {
        foreignKey: 'ID_Departement'
      });

      // 🔗 une matière a plusieurs heures effectuées
      Matiere.hasMany(models.HeureEffectuee, {
        foreignKey: 'ID_Matiere'
      });
    }

  }

  Matiere.init({
    ID_Matiere: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Intitule: DataTypes.STRING,
    Filiere: DataTypes.STRING,
    Niveau: DataTypes.STRING,
    Volume_Horaire_Prevu: DataTypes.INTEGER,
    ID_Departement: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Matiere',     // ✅ côté code
    tableName: 'MATIERES'     // ✅ côté base
  });

  return Matiere;
};