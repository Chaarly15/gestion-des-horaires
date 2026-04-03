'use strict';

module.exports = (sequelize, DataTypes) => {
  const HeureEffectuee = sequelize.define('HeureEffectuee', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    date_cours: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    type_heure: {
      type: DataTypes.ENUM('CM', 'TD', 'TP'),
      allowNull: false
    },
    duree: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false
    },
    salle: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    id_enseignant: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_matiere: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_annee: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'heure_effectuees',
    timestamps: true
  });

  HeureEffectuee.associate = (models) => {
    HeureEffectuee.belongsTo(models.Enseignant, {
      foreignKey: 'id_enseignant',
      as: 'enseignant'
    });
    HeureEffectuee.belongsTo(models.Matiere, {
      foreignKey: 'id_matiere',
      as: 'matiere'
    });
    HeureEffectuee.belongsTo(models.AnneeAcademique, {
      foreignKey: 'id_annee',
      as: 'annee_academique'
    });
  };

  return HeureEffectuee;
};