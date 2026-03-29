'use strict';

module.exports = {

  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('HEURE-EFFECTUEES', {
      ID_Heure: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      Date_Cours: {
        type: Sequelize.DATE,
        allowNull: false
      },

      Type_Heure: {
        type: Sequelize.ENUM('CM', 'TD', 'TP'),
        allowNull: false
      },

      Duree: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      Salle: {
        type: Sequelize.STRING
      },

      Observations: {
        type: Sequelize.TEXT
      },

      ID_Enseignant: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ENSEIGNANT',
          key: 'ID_Enseignant'
        }
      },

      ID_Matiere: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'MATIERES',
          key: 'ID_Matiere'
        }
      },

      ID_Annee: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ANNEE-ACADEMIQUE',
          key: 'ID_Annee'
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
    await queryInterface.dropTable('HEURE-EFFECTUEES');
  }

};