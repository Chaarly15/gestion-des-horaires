'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('heure_effectuees', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      date_cours: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      type_heure: {
        type: Sequelize.ENUM('CM', 'TD', 'TP'),
        allowNull: false
      },
      duree: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false
      },
      salle: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      observations: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      id_enseignant: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'enseignants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      id_matiere: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'matieres',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      id_annee: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'annee_academiques',
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
    await queryInterface.dropTable('heure_effectuees');
  }
};