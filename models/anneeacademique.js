'use strict';

module.exports = (sequelize, DataTypes) => {
  const AnneeAcademique = sequelize.define('AnneeAcademique', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    libelle: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    date_debut: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    date_fin: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    h_contract_permanent: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      defaultValue: 0
    },
    h_contract_vacataire: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'annee_academiques',
    timestamps: true
  });

  AnneeAcademique.associate = (models) => {
    // Correction : id_annee en minuscules
    AnneeAcademique.hasMany(models.HeureEffectuee, {
      foreignKey: 'id_annee',
      as: 'heures_effectuees'
    });

    AnneeAcademique.hasMany(models.ParametreEquivalence, {
      foreignKey: 'id_annee',
      as: 'parametres_equivalence'
    });
  };

  return AnneeAcademique;
};