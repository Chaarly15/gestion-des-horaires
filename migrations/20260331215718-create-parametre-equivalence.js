'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('parametre_equivalences', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      type_source: {
        type: Sequelize.ENUM('CM', 'TD', 'TP'),
        allowNull: false
      },
      type_cible: {
        type: Sequelize.ENUM('CM', 'TD', 'TP'),
        allowNull: false
      },
      coefficient: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false,
        defaultValue: 1
      },
      id_annee: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'annee_academiques',
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
    await queryInterface.dropTable('parametre_equivalences');
  }
};