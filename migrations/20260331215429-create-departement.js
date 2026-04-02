'use strict';

module.exports = {

  up: async (queryInterface, Sequelize) => {

    await queryInterface.createTable('departements', {

      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      nom_departement: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
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
    await queryInterface.dropTable('departements');
  }

};