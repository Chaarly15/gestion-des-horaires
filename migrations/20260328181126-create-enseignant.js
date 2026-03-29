'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ENSEIGNANT', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Nom: {
        type: Sequelize.STRING
      },
      Prenom: {
        type: Sequelize.STRING
      },
      Grade: {
        type: Sequelize.STRING
      },
      Statut: {
        type: Sequelize.STRING
      },
      Taux_Horaire: {
        type: Sequelize.FLOAT
      },
      ID_Departement: {
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
    await queryInterface.dropTable('ENSEIGNANT');
  }
};