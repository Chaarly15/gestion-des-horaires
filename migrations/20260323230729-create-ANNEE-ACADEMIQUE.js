'use strict';

module.exports = {

  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ANNEE-ACADEMIQUE', {
      ID_Annee: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      Libelle: {
        type: Sequelize.STRING,
        allowNull: false
      },

      Date_Debut: {
        type: Sequelize.DATE,
        allowNull: false
      },

      Date_Fin: {
        type: Sequelize.DATE,
        allowNull: false
      },

      Heures_Contractuelles_Permanents: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      Heures_Contractuelles_Vacataires: {
        type: Sequelize.INTEGER,
        allowNull: false
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
    await queryInterface.dropTable('ANNEE-ACADEMIQUE');
  }

};