'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PARAMETRE-EQUIVALENCES', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Type_Source: {
        type: Sequelize.STRING
      },
      Type_Cible: {
        type: Sequelize.STRING
      },
      Coefficient: {
        type: Sequelize.FLOAT
      },
      ID_Annee: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PARAMETRE-EQUIVALENCEs');
  }
};