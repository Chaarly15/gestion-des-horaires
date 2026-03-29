'use strict';

module.exports = {

  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MATIERES', {
      ID_Matiere: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      Intitule: {
        type: Sequelize.STRING,
        allowNull: false
      },

      Filiere: {
        type: Sequelize.STRING,
        allowNull: false
      },

      Niveau: {
        type: Sequelize.ENUM('L1', 'L2', 'L3', 'M1', 'M2'),
        allowNull: false
      },

      Volume_Horaire_Prevu: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      ID_Departement: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'DEPARTEMENT',
          key: 'ID_Departement'
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
    await queryInterface.dropTable('MATIERES');
  }

};