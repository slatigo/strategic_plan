'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Handle the Rename in intermediate_outcome_indicators
    const intermediateTable = await queryInterface.describeTable('intermediate_outcome_indicators');
    
    if (intermediateTable.intermediate_outcome_indicator && !intermediateTable.indicator) {
      // Only rename if the OLD name exists AND the NEW name doesn't
      await queryInterface.renameColumn(
        'intermediate_outcome_indicators', 
        'intermediate_outcome_indicator', 
        'indicator'
      );
      console.log('Successfully renamed intermediate_outcome_indicator to indicator');
    }

    // 2. Define the tables that need the unit_of_measure column
    const tables = [
      'outcome_indicators', 
      'intermediate_outcome_indicators', 
      'output_indicators'
    ];
    
    for (const table of tables) {
      const tableCols = await queryInterface.describeTable(table);
      
      if (!tableCols.unit_of_measure) {
        await queryInterface.addColumn(table, 'unit_of_measure', {
          type: Sequelize.STRING(50),
          allowNull: true
        });
        console.log(`Added unit_of_measure to ${table}`);
      } else {
        console.log(`Column unit_of_measure already exists in ${table}, skipping...`);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = [
      'outcome_indicators', 
      'intermediate_outcome_indicators', 
      'output_indicators'
    ];

    // 1. Remove unit_of_measure from all tables
    for (const table of tables) {
      const tableCols = await queryInterface.describeTable(table);
      if (tableCols.unit_of_measure) {
        await queryInterface.removeColumn(table, 'unit_of_measure');
      }
    }

    // 2. Revert the rename if necessary
    const intermediateTable = await queryInterface.describeTable('intermediate_outcome_indicators');
    if (intermediateTable.indicator && !intermediateTable.intermediate_outcome_indicator) {
      await queryInterface.renameColumn(
        'intermediate_outcome_indicators', 
        'indicator', 
        'intermediate_outcome_indicator'
      );
    }
  }
};