'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sp_interventions', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      sp_intermediate_outcome_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sp_intermediate_outcomes', key: 'id' },
        onDelete: 'CASCADE'
      },
      intervention_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'interventions', key: 'id' },
        onDelete: 'CASCADE'
      },
      plan_id: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('sp_interventions'); }
};