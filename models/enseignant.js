'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Enseignant extends Model {

    static associate(models) {
      // 🔗 appartient à un département
      Enseignant.belongsTo(models.Departement, {
        foreignKey: 'ID_Departement'
      });

      // 🔗 a plusieurs heures effectuées
      Enseignant.hasMany(models.HeureEffectuee, {
        foreignKey: 'ID_Enseignant'
      });

      // 🔗 a un utilisateur
      Enseignant.hasOne(models.Utilisateur, {
        foreignKey: 'ID_Enseignant'
      });
    }

  }

  Enseignant.init({
    ID_Enseignant: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Nom: DataTypes.STRING,
    Prenom: DataTypes.STRING,
    Grade: DataTypes.STRING,
    Statut: DataTypes.STRING,
    Taux_Horaire: DataTypes.FLOAT,
    ID_Departement: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Enseignant',   // ✅ côté code
    tableName: 'ENSEIGNANT'    // ✅ côté base
  });

  return Enseignant;
};