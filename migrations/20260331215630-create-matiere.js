'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('matieres', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      intitule: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      filiere: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      niveau: {
        type: Sequelize.ENUM('L1', 'L2', 'L3', 'M1', 'M2'),
        allowNull: false
      },
      volume_horaire_prevu: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: false,
        defaultValue: 0
      },
      id_departement: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'departements',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
    await queryInterface.dropTable('matieres');
  }
};
