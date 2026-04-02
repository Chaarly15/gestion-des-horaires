'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete('matieres', null, {});

    await queryInterface.bulkInsert('matieres', [
      {
        id: 1,
        intitule: 'Programmation Web',
        filiere: 'Informatique',
        niveau: 'L2',
        volume_horaire_prevu: 60.00,
        id_departement: 1, 
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        intitule: 'Base de Données',
        filiere: 'Informatique',
        niveau: 'L3',
        volume_horaire_prevu: 50.00,
        id_departement: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        intitule: 'Gestion des Ressources Humaines',
        filiere: 'Gestion',
        niveau: 'M1',
        volume_horaire_prevu: 40.00,
        id_departement: 2, 
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        intitule: 'Comptabilité Générale',
        filiere: 'Finance',
        niveau: 'L3',
        volume_horaire_prevu: 45.00,
        id_departement: 3, 
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete('matieres', null, {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
};