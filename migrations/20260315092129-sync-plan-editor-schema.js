'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add 'data_source' ONLY to the table that's missing it
    await queryInterface.addColumn('sp_intermediate_outcome_indicators', 'data_source', { 
      type: Sequelize.TEXT, 
      allowNull: true 
    });

    // 2. Remove 'plan_id' from the "Deep" nested tables
    const tablesToRemovePlanId = [
      'sp_outcomes',
      'sp_intermediate_outcomes',
      'sp_outcome_indicator_targets',
      'sp_intermediate_outcome_indicator_targets',
      'sp_output_indicator_targets',
      'sp_output_action_budgets'
    ];

    for (const table of tablesToRemovePlanId) {
      await queryInterface.removeColumn(table, 'plan_id').catch(() => {
        console.log(`Column plan_id already removed from ${table}`);
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // 1. ONLY remove from the table we added it to in 'up'
    await queryInterface.removeColumn('sp_intermediate_outcome_indicators', 'data_source').catch(() => {});

    // 2. Add plan_id back
    const tablesToRemovePlanId = [
      'sp_outcomes',
      'sp_intermediate_outcomes',
      'sp_outcome_indicator_targets',
      'sp_intermediate_outcome_indicator_targets',
      'sp_output_indicator_targets',
      'sp_output_action_budgets'
    ];

    for (const table of tablesToRemovePlanId) {
      await queryInterface.addColumn(table, 'plan_id', { 
        type: Sequelize.INTEGER, 
        allowNull: true 
      }).catch(() => {});
    }
  }
};