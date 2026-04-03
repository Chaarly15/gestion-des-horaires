'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete('utilisateurs', null, {});

    const passwordHash = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('utilisateurs', [
      {
        id: 1,
        login: 'admin',
        mot_de_passe: passwordHash,
        role: 'Administrateur',
        id_enseignant: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        login: 'rh_user',
        mot_de_passe: passwordHash,
        role: 'RH',
        id_enseignant: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        login: 'jean.kouassi',
        mot_de_passe: passwordHash,
        role: 'Enseignant',
        id_enseignant: 1, // Lie à l'enseignant ID 1 (Kouassi Jean) qu'on a créé
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete('utilisateurs', null, {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
};