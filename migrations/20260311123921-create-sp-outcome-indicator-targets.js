'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sp_outcome_indicator_targets', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      fy: { type: Sequelize.STRING(20), allowNull: false },
      sp_outcome_indicator_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sp_outcome_indicators', key: 'id' },
        onDelete: 'CASCADE'
      },
      val: { type: Sequelize.STRING(255), defaultValue: null },
      plan_id: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addConstraint('sp_outcome_indicator_targets', {
      fields: ['fy', 'sp_outcome_indicator_id'],
      type: 'unique',
      name: 'unique_fy_outcome_indicator_target'
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('sp_outcome_indicator_targets'); }
};