'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('sp_intermediate_outcome_indicators', 'baseline_value', {
      type: Sequelize.STRING,
      allowNull: true,
      // 'after' is optional, but keeps your DB table tidy
      after: 'intermediate_outcome_indicator_id' 
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('sp_intermediate_outcome_indicators', 'baseline_value');
  }
};