'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HEURE-EFFECTUEES', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Date_Cours: {
        type: Sequelize.DATE
      },
      Type_Heure: {
        type: Sequelize.STRING
      },
      Duree: {
        type: Sequelize.FLOAT
      },
      Salle: {
        type: Sequelize.STRING
      },
      Observations: {
        type: Sequelize.TEXT
      },
      ID_Enseignant: {
        type: Sequelize.INTEGER
      },
      ID_Matiere: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('HEURE-EFFECTUEEs');
  }
};