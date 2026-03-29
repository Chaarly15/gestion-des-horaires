'use strict';

module.exports = {

  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UTILISATEURS', {
      ID_Utilisateur: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      Login: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },

      Mot_De_Passe: {
        type: Sequelize.STRING,
        allowNull: false
      },

      Role: {
        type: Sequelize.ENUM('Administrateur', 'RH', 'Enseignant'),
        allowNull: false
      },

      ID_Enseignant: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ENSEIGNANT',
          key: 'ID_Enseignant'
        }
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }

    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('UTILISATEURS');
  }

};