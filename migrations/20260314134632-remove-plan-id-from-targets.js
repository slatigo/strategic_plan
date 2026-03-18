'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove plan_id from the Target (yearly values) tables
    await queryInterface.removeColumn('sp_outcome_indicator_targets', 'plan_id');
    await queryInterface.removeColumn('sp_intermediate_outcome_indicator_targets', 'plan_id');
    await queryInterface.removeColumn('sp_output_indicator_targets', 'plan_id');
  },

  down: async (queryInterface, Sequelize) => {
    // To undo this, we would add the columns back
    await queryInterface.addColumn('sp_outcome_indicator_targets', 'plan_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.addColumn('sp_intermediate_outcome_indicator_targets', 'plan_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.addColumn('sp_output_indicator_targets', 'plan_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  }
};