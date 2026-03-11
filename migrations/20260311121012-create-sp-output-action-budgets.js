'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sp_output_action_budgets', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      fy: { type: Sequelize.STRING(20), allowNull: false },
      sp_output_action_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sp_output_actions', key: 'id' },
        onDelete: 'CASCADE'
      },
      val: { type: Sequelize.STRING(255), allowNull: false },
      plan_id: { type: Sequelize.INTEGER, allowNull: false },
      budget_source: { type: Sequelize.STRING(255) },
      responsible_office: { type: Sequelize.STRING(255) },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addConstraint('sp_output_action_budgets', {
      fields: ['fy', 'sp_output_action_id'],
      type: 'unique',
      name: 'unique_fy_action_budget'
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('sp_output_action_budgets'); }
};