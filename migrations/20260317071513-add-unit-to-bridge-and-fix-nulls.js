'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add unit_of_measure to the Bridge Table
    await queryInterface.addColumn('NationalAlignments', 'unit_of_measure', {
      type: Sequelize.STRING,
      allowNull: true // Some actions might not need a formal unit
    });

    // 2. Fix the NationalValues table to allow the NULLs in your SQL script
    await queryInterface.changeColumn('NationalValues', 'value', {
      type: Sequelize.STRING,
      allowNull: true // This stops the #1048 error
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Reverse the changes if needed
    await queryInterface.removeColumn('NationalAlignments', 'unit_of_measure');
    await queryInterface.changeColumn('NationalValues', 'value', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};