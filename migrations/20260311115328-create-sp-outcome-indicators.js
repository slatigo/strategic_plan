'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sp_outcome_indicators', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      outcome_indicator_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'outcome_indicators', key: 'id' },
        onDelete: 'CASCADE'
      },
      sp_outcome_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sp_outcomes', key: 'id' },
        onDelete: 'CASCADE'
      },
      adapted_outcome_indicator: { type: Sequelize.STRING(255), defaultValue: '0' },
      responsible_office: { type: Sequelize.STRING(255) },
      data_source: { type: Sequelize.STRING(255) },
      plan_id: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addConstraint('sp_outcome_indicators', {
      fields: ['outcome_indicator_id', 'sp_outcome_id'],
      type: 'unique',
      name: 'unique_sp_outcome_indicator'
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('sp_outcome_indicators'); }
};