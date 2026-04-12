'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = [
      'sp_outcome_indicators',
      'sp_intermediate_outcome_indicators',
      'sp_output_indicators'
    ];

    for (const table of tables) {
      // Get table description to check existing columns
      const tableDefinition = await queryInterface.describeTable(table);

      if (!tableDefinition.unit_of_measure) {
        await queryInterface.addColumn(table, 'unit_of_measure', {
          type: Sequelize.STRING(255),
          allowNull: true,
          defaultValue: null
        });
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tables = [
      'sp_outcome_indicators',
      'sp_intermediate_outcome_indicators',
      'sp_output_indicators'
    ];

    for (const table of tables) {
      const tableDefinition = await queryInterface.describeTable(table);
      if (tableDefinition.unit_of_measure) {
        await queryInterface.removeColumn(table, 'unit_of_measure');
      }
    }
  }
};