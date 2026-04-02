'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete('log_actions', null, {});

    // Récupération sécurisée de l'admin
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM utilisateurs WHERE login = 'admin' LIMIT 1;`
    );
    
    // Si l'admin existe, on utilise son ID, sinon on met 1 par défaut (ou on saute)
    const adminId = (users && users.length > 0) ? users[0].id : 1;

    await queryInterface.bulkInsert('log_actions', [
      {
        date_action: new Date(),
        action: 'Connexion initiale',
        table_concernee: 'utilisateurs',
        id_utilisateur: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        date_action: new Date(),
        action: 'Création du département informatique',
        table_concernee: 'departements',
        id_utilisateur: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        date_action: new Date(),
        action: 'Ajout de la matière Programmation Web',
        table_concernee: 'matieres',
        id_utilisateur: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete('log_actions', null, {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
};