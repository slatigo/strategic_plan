'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sp_objectives', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      plan_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'strategic_plans', key: 'id' },
        onDelete: 'CASCADE'
      },
      objective_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'objectives', key: 'id' },
        onDelete: 'CASCADE'
      },
      org_objective: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // Prevent adding the same objective twice to the same plan
    await queryInterface.addConstraint('sp_objectives', {
      fields: ['plan_id', 'objective_id'],
      type: 'unique',
      name: 'unique_plan_objective_selection'
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('sp_objectives'); }
};