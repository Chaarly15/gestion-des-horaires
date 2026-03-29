'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LogAction extends Model {

    static associate(models) {
      // 🔗 appartient à un utilisateur
      LogAction.belongsTo(models.Utilisateur, {
        foreignKey: 'ID_Utilisateur'
      });
    }

  }

  LogAction.init({
    ID_Log: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Date_Action: DataTypes.DATE,
    Action: DataTypes.STRING,
    Table_Concernee: DataTypes.STRING,
    ID_Utilisateur: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'LogAction',     // ✅ côté code
    tableName: 'LOG_ACTIONS'    // ✅ côté base
  });

  return LogAction;
};