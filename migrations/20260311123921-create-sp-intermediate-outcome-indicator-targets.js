'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sp_intermediate_outcome_indicator_targets', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      fy: { type: Sequelize.STRING(20), allowNull: false },
      sp_intermediate_outcome_indicator_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sp_intermediate_outcome_indicators', key: 'id' },
        onDelete: 'CASCADE'
      },
      val: { type: Sequelize.STRING(40), defaultValue: null },
      plan_id: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // Unique constraint to prevent duplicate targets for the same year/indicator
    await queryInterface.addConstraint('sp_intermediate_outcome_indicator_targets', {
      fields: ['fy', 'sp_intermediate_outcome_indicator_id'],
      type: 'unique',
      name: 'unique_fy_int_indicator_target'
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('sp_intermediate_outcome_indicator_targets'); }
};