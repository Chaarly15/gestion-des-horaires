'use strict';

module.exports = (sequelize, DataTypes) => {
  const Enseignant = sequelize.define('Enseignant', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nom: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    prenom: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    grade: {
      type: DataTypes.ENUM('Assistant', 'Maître-Assistant', 'Professeur', 'Autres'),
      allowNull: false
    },
    statut: {
      type: DataTypes.ENUM('Permanent', 'Vacataire'),
      allowNull: false
    },
    taux_horaire: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0
    },
    id_departement: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'enseignants',
    timestamps: true
  });

  Enseignant.associate = (models) => {
    // Un enseignant appartient à un département
    Enseignant.belongsTo(models.Departement, {
      foreignKey: 'id_departement',
      as: 'departement'
    });

    // Un enseignant peut avoir plusieurs fiches d'heures
    Enseignant.hasMany(models.HeureEffectuee, {
      foreignKey: 'id_enseignant',
      as: 'heures_effectuees'
    });

    // Un enseignant peut avoir un compte utilisateur
    Enseignant.hasOne(models.Utilisateur, {
      foreignKey: 'id_enseignant',
      as: 'utilisateur'
    });
  };

  return Enseignant;
};