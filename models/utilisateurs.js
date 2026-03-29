'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Utilisateur extends Model {

    static associate(models) {
      // 🔗 appartient à un enseignant
      Utilisateur.belongsTo(models.Enseignant, {
        foreignKey: 'ID_Enseignant'
      });

      // 🔗 un utilisateur a plusieurs logs
      Utilisateur.hasMany(models.LogAction, {
        foreignKey: 'ID_Utilisateur'
      });
    }

  }

  Utilisateur.init({
    ID_Utilisateur: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Login: DataTypes.STRING,
    Mot_De_Passe: DataTypes.STRING,
    Role: DataTypes.STRING,
    ID_Enseignant: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Utilisateur',     // ✅ côté code
    tableName: 'UTILISATEURS'     // ✅ côté base
  });

  return Utilisateur;
};