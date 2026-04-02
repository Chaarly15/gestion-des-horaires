'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete('annee_academiques', null, {});
    
    await queryInterface.bulkInsert('annee_academiques', [
      {
        id: 1,
        libelle: '2023-2024',
        date_debut: '2023-09-01',
        date_fin: '2024-06-30',
        h_contract_permanent: 192.00,
        h_contract_vacataire: 120.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        libelle: '2024-2025',
        date_debut: '2024-09-01',
        date_fin: '2025-06-30',
        h_contract_permanent: 200.00,
        h_contract_vacataire: 130.00,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete('annee_academiques', null, {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
};