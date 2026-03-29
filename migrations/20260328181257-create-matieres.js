'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MATIERES', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Intitule: {
        type: Sequelize.STRING
      },
      Filiere: {
        type: Sequelize.STRING
      },
      Niveau: {
        type: Sequelize.STRING
      },
      Volume_Horaire_Prevu: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('MATIERES');
  }
};