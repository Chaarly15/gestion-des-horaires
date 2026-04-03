'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete('departements', null, {});
    
    await queryInterface.bulkInsert('departements', [
      { id: 1, nom_departement: 'Informatique', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, nom_departement: 'Ressources Humaines', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, nom_departement: 'Finance', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, nom_departement: 'Marketing', createdAt: new Date(), updatedAt: new Date() }
    ]);
    
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete('departements', null, {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
};