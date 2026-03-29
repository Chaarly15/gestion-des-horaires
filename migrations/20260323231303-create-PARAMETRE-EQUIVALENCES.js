'use strict';

module.exports = {

  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PARAMETRE-EQUIVALENCES', {
      ID_Parametre: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      Type_Source: {
        type: Sequelize.ENUM('CM', 'TD', 'TP'),
        allowNull: false
      },

      Type_Cible: {
        type: Sequelize.ENUM('CM', 'TD', 'TP'),
        allowNull: false
      },

      Coefficient: {
        type: Sequelize.FLOAT,
        allowNull: false
      },

      ID_Annee: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ANNEE-ACADEMIQUE',
          key: 'ID_Annee'
        }
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
    await queryInterface.dropTable('PARAMETRE-EQUIVALENCES');
  }

};