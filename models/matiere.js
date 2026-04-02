'use strict';

module.exports = (sequelize, DataTypes) => {
  const Matiere = sequelize.define('Matiere', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    intitule: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    filiere: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    niveau: {
      type: DataTypes.ENUM('L1', 'L2', 'L3', 'M1', 'M2'),
      allowNull: false
    },
    volume_horaire_prevu: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      defaultValue: 0
    },
    id_departement: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'matieres',
    timestamps: true
  });

  Matiere.associate = (models) => {
    // Une matière appartient à un département
    Matiere.belongsTo(models.Departement, {
      foreignKey: 'id_departement',
      as: 'departement'
    });

    // Une matière est liée à plusieurs enregistrements d'heures
    Matiere.hasMany(models.HeureEffectuee, {
      foreignKey: 'id_matiere',
      as: 'heures_effectuees'
    });
  };

  return Matiere;
};