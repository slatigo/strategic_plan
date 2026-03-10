'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add 'role' column
    /*await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.ENUM('npa_admin', 'mda_user'),
      defaultValue: 'mda_user',
      allowNull: false
    });*/

    // Add 'active' column
    await queryInterface.addColumn('Users', 'active', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    //await queryInterface.removeColumn('Users', 'role');
    await queryInterface.removeColumn('Users', 'active');
  }
};