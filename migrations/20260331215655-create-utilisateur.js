'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('utilisateurs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      login: {
        type: Sequelize.STRING(60),
        allowNull: false,
        unique: true
      },
      mot_de_passe: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('Administrateur', 'RH', 'Enseignant'),
        allowNull: false
      },
      id_enseignant: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'enseignants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.dropTable('utilisateurs');
  }
};