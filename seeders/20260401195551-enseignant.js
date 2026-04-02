'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete('enseignants', null, {});

    await queryInterface.bulkInsert('enseignants', [
      {
        id: 1,
        nom: 'Kouassi',
        prenom: 'Jean',
        grade: 'Professeur',
        statut: 'Permanent',
        taux_horaire: 50000.00,
        id_departement: 1, // Informatique
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        nom: 'Koffi',
        prenom: 'Marie',
        grade: 'Maître-Assistant',
        statut: 'Vacataire',
        taux_horaire: 30000.00,
        id_departement: 1, // Informatique
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        nom: 'Yao',
        prenom: 'Paul',
        grade: 'Assistant',
        statut: 'Permanent',
        taux_horaire: 25000.00,
        id_departement: 2, // RH
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete('enseignants', null, {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
};