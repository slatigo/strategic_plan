'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('NationalValues', 'value', {
      type: Sequelize.STRING,
      allowNull: true // This is the fix!
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('NationalValues', 'value', {
      type: Sequelize.STRING,
      allowNull: false // Revert back if needed
    });
  }
};