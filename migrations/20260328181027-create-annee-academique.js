'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ANNEE-ACADEMIQUE', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Libelle: {
        type: Sequelize.STRING
      },
      Date_Debut: {
        type: Sequelize.DATE
      },
      Date_Fin: {
        type: Sequelize.DATE
      },
      Heures_Contractuelles_Permanents: {
        type: Sequelize.INTEGER
      },
      Heures_Contractuelles_Vacataires: {
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
    await queryInterface.dropTable('ANNEE-ACADEMIQUE');
  }
};