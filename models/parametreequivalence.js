'use strict';

module.exports = (sequelize, DataTypes) => {
  const ParametreEquivalence = sequelize.define('ParametreEquivalence', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    type_source: {
      type: DataTypes.ENUM('CM', 'TD', 'TP'),
      allowNull: false
    },
    type_cible: {
      type: DataTypes.ENUM('CM', 'TD', 'TP'),
      allowNull: false
    },
    coefficient: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 1
    },
    id_annee: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'parametre_equivalences',
    timestamps: true
  });

  ParametreEquivalence.associate = (models) => {
    // Un paramètre appartient à une année académique précise
    ParametreEquivalence.belongsTo(models.AnneeAcademique, {
      foreignKey: 'id_annee',
      as: 'annee_academique'
    });
  };

  return ParametreEquivalence;
};