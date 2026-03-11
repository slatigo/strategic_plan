'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('intermediate_outcomes', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      outcome_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'outcomes', key: 'id' },
        onDelete: 'CASCADE'
      },
      intermediate_outcome_code: { type: Sequelize.STRING(255), allowNull: false },
      intermediate_outcome: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('intermediate_outcomes'); }
};