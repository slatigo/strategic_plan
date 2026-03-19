'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Unique constraint for Outcomes
    await queryInterface.addConstraint('sp_outcome_indicator_reports', {
      fields: ['mda_report_id', 'sp_outcome_indicator_id'],
      type: 'unique',
      name: 'uk_report_outcome_final' // Name used here
    });

    // 2. Unique constraint for Intermediates
    await queryInterface.addConstraint('sp_intermediate_outcome_indicator_reports', {
      fields: ['mda_report_id', 'sp_intermediate_outcome_indicator_id'],
      type: 'unique',
      name: 'uk_int_report_ind'
    });

    // 3. Unique constraint for Action Expenditures
    await queryInterface.addConstraint('sp_output_action_reports', {
      fields: ['mda_report_id', 'sp_output_action_id'],
      type: 'unique',
      name: 'uk_action_report_item'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // FIX: Match the names exactly as they are in the 'up' block
    await queryInterface.removeConstraint('sp_outcome_indicator_reports', 'uk_report_outcome_final');
    await queryInterface.removeConstraint('sp_intermediate_outcome_indicator_reports', 'uk_int_report_ind');
    await queryInterface.removeConstraint('sp_output_action_reports', 'uk_action_report_item');
  }
};