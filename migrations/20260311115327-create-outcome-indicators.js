'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('outcome_indicators', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      indicator_code: { type: Sequelize.STRING(30) },
      outcome_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'outcomes', key: 'id' },
        onDelete: 'CASCADE'
      },
      indicator: { type: Sequelize.STRING(255), allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('outcome_indicators'); }
};