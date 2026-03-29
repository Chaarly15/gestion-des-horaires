'use strict';

module.exports = {

  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ENSEIGNANT', {
      ID_Enseignant: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      Nom: {
        type: Sequelize.STRING,
        allowNull: false
      },

      Prenom: {
        type: Sequelize.STRING,
        allowNull: false
      },

      Grade: {
        type: Sequelize.ENUM('Assistant', 'Maître-Assistant', 'Professeur', 'Autres'),
        allowNull: false
      },

      Statut: {
        type: Sequelize.ENUM('Permanent', 'Vacataire'),
        allowNull: false
      },

      Taux_Horaire: {
        type: Sequelize.FLOAT,
        allowNull: false
      },

      ID_Departement: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'DEPARTEMENT',
          key: 'ID_Departement'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }

    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('ENSEIGNANT');
  }

};
