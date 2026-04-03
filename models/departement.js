'use strict';

module.exports = (sequelize, DataTypes) => {
  const Departement = sequelize.define('Departement', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nom_departement: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'departements',
    timestamps: true
  });

  Departement.associate = (models) => {
    // Changement ici : id_departement en minuscules
    Departement.hasMany(models.Enseignant, {
      foreignKey: 'id_departement', 
      as: 'enseignants'
    });

    Departement.hasMany(models.Matiere, {
      foreignKey: 'id_departement', 
      as: 'matieres'
    });
  };

  return Departement;
};