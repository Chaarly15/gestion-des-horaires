'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('enseignants', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nom: {
        type: Sequelize.STRING(80),
        allowNull: false
      },
      prenom: {
        type: Sequelize.STRING(80),
        allowNull: false
      },
      grade: {
        type: Sequelize.ENUM(
          'Assistant',
          'Maître-Assistant',
          'Professeur',
          'Autres'
        ),
        allowNull: false
      },
      statut: {
        type: Sequelize.ENUM('Permanent', 'Vacataire'),
        allowNull: false
      },
      taux_horaire: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0
      },
      id_departement: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'departements',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
    await queryInterface.dropTable('enseignants');
  }
};