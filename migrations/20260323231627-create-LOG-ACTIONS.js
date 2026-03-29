'use strict';

module.exports = {

  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('LOG-ACTIONS', {
      ID_Log: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      Date_Action: {
        type: Sequelize.DATE,
        allowNull: false
      },

      Action: {
        type: Sequelize.STRING,
        allowNull: false
      },

      Table_Concernee: {
        type: Sequelize.STRING,
        allowNull: false
      },

      ID_Utilisateur: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'UTILISATEURS',
          key: 'ID_Utilisateur'
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
    await queryInterface.dropTable('LOG-ACTIONS');
  }

};