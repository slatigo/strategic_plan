'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sp_intermediate_outcome_indicators', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      intermediate_outcome_indicator_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'intermediate_outcome_indicators', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      sp_intermediate_outcome_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sp_intermediate_outcomes', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      adapted_intermediate_outcome_indicator: { type: Sequelize.STRING(255), defaultValue: '0' },
      responsible_office: { type: Sequelize.STRING(255) },
      plan_id: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // Unique constraint to ensure one adaptation per indicator per plan-link
    await queryInterface.addConstraint('sp_intermediate_outcome_indicators', {
      fields: ['intermediate_outcome_indicator_id', 'sp_intermediate_outcome_id'],
      type: 'unique',
      name: 'unique_sp_int_outcome_indicator'
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('sp_intermediate_outcome_indicators'); }
};