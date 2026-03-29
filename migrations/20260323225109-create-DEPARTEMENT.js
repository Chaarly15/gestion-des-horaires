'use strict';

module.exports = {

  // UP = crée la table
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('DEPARTEMENT' , {
      ID_Departement: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      nom_DEPARTEMENT: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true 
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

  //DOWN = supprime la table (annulation)

  down: async (queryInterface) => {
    await queryInterface.dropTable('DEPARTEMENT');
  }
  
};
