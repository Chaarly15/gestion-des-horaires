'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('annee_academiques', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      libelle: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      date_debut: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      date_fin: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      h_contract_permanent: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: false,
        defaultValue: 0
      },
      h_contract_vacataire: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: false,
        defaultValue: 0
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
    await queryInterface.dropTable('annee_academiques');
  }
};