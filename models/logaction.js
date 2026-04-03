'use strict';

module.exports = (sequelize, DataTypes) => {
  const LogAction = sequelize.define('LogAction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    date_action: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    action: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    table_concernee: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    id_utilisateur: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'log_actions',
    timestamps: true 
  });

  LogAction.associate = (models) => {
    // Un log est lié à l'utilisateur qui a fait l'action
    LogAction.belongsTo(models.Utilisateur, {
      foreignKey: 'id_utilisateur',
      as: 'createur'
    });
  };

  return LogAction;
};