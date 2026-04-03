'use strict';

module.exports = (sequelize, DataTypes) => {
  const Utilisateur = sequelize.define('Utilisateur', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    login: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true
    },
    mot_de_passe: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('Administrateur', 'RH', 'Enseignant'),
      allowNull: false
    },
    id_enseignant: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'utilisateurs',
    timestamps: true
  });

  Utilisateur.associate = (models) => {
    // Lien vers l'enseignant (si applicable)
    Utilisateur.belongsTo(models.Enseignant, {
      foreignKey: 'id_enseignant',
      as: 'enseignant'
    });

    // Un utilisateur génère des logs d'actions
    Utilisateur.hasMany(models.LogAction, {
      foreignKey: 'id_utilisateur',
      as: 'logs'
    });
  };

  return Utilisateur;
};