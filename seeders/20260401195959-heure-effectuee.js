'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete('heure_effectuees', null, {});

    await queryInterface.bulkInsert('heure_effectuees', [
      {
        id: 1,
        date_cours: '2024-01-10',
        type_heure: 'CM',
        duree: 2.00,
        salle: 'A101',
        observations: 'Cours introductif',
        id_enseignant: 1,
        id_matiere: 1,
        id_annee: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        date_cours: '2024-01-12',
        type_heure: 'TD',
        duree: 1.50,
        salle: 'B202',
        observations: 'Exercices pratiques',
        id_enseignant: 2,
        id_matiere: 2,
        id_annee: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        date_cours: '2024-02-05',
        type_heure: 'TP',
        duree: 3.00,
        salle: 'Lab1',
        observations: 'Travaux pratiques',
        id_enseignant: 1,
        id_matiere: 1,
        id_annee: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete('heure_effectuees', null, {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
};