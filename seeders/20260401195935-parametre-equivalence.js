'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete('parametre_equivalences', null, {});

    await queryInterface.bulkInsert('parametre_equivalences', [
      {
        id: 1,
        type_source: 'CM',
        type_cible: 'TD',
        coefficient: 1.50,
        id_annee: 1, // 2023-2024
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        type_source: 'TD',
        type_cible: 'TP',
        coefficient: 1.20,
        id_annee: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        type_source: 'CM',
        type_cible: 'TP',
        coefficient: 2.00,
        id_annee: 2, // 2024-2025
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete('parametre_equivalences', null, {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
};