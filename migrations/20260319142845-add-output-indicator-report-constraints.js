'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addConstraint('sp_output_indicator_reports', {
        fields: ['mda_report_id', 'sp_output_indicator_id'],
        type: 'unique',
        name: 'uk_output_report_unique'
      });
      console.log("Successfully added unique constraint to Output Reports.");
    } catch (err) {
      console.log("Constraint already exists or table is locked. Skipping...");
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('sp_output_indicator_reports', 'uk_output_report_unique');
  }
};