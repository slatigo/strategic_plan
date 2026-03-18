'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add to Outcome Indicators
    await queryInterface.addColumn('sp_outcome_indicators', 'baseline_value', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // 2. Add to Output Indicators (The level below Interventions)
    await queryInterface.addColumn('sp_output_indicators', 'baseline_value', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Only remove what we added in this specific migration
    await queryInterface.removeColumn('sp_outcome_indicators', 'baseline_value');
    await queryInterface.removeColumn('sp_output_indicators', 'baseline_value');
  }
};