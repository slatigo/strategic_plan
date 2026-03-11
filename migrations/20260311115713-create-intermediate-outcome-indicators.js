'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('intermediate_outcome_indicators', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      intermediate_outcome_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'intermediate_outcomes', key: 'id' },
        onDelete: 'CASCADE'
      },
      intermediate_outcome_indicator_code: { type: Sequelize.STRING(255), allowNull: false },
      intermediate_outcome_indicator: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('intermediate_outcome_indicators'); }
};