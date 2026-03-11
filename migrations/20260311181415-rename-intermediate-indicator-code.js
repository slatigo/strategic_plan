'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('intermediate_outcome_indicators');

    // Check if the old long name exists and the new short name doesn't
    if (tableInfo.intermediate_outcome_indicator_code && !tableInfo.indicator_code) {
      await queryInterface.renameColumn(
        'intermediate_outcome_indicators',
        'intermediate_outcome_indicator_code',
        'indicator_code'
      );
      console.log('Successfully renamed intermediate_outcome_indicator_code to indicator_code');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('intermediate_outcome_indicators');

    if (tableInfo.indicator_code && !tableInfo.intermediate_outcome_indicator_code) {
      await queryInterface.renameColumn(
        'intermediate_outcome_indicators',
        'indicator_code',
        'intermediate_outcome_indicator_code'
      );
    }
  }
};