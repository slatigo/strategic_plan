'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sp_output_actions', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      sp_output_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sp_outputs', key: 'id' },
        onDelete: 'CASCADE'
      },
      output_action_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'output_actions', key: 'id' },
        onDelete: 'CASCADE'
      },
      adapted_output_action: { type: Sequelize.STRING(255), defaultValue: '0' },
      responsible_office: { type: Sequelize.STRING(255) },
      budget_source: { type: Sequelize.INTEGER },
      plan_id: { type: Sequelize.INTEGER, allowNull: false },
      org_id: { type: Sequelize.INTEGER },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addConstraint('sp_output_actions', {
      fields: ['sp_output_id', 'output_action_id', 'adapted_output_action'],
      type: 'unique',
      name: 'unique_sp_output_action'
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('sp_output_actions'); }
};