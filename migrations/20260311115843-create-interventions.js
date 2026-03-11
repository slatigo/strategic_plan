'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('interventions', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      intermediate_outcome_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'intermediate_outcomes', key: 'id' },
        onDelete: 'CASCADE'
      },
      intervention_code: { type: Sequelize.STRING(255) },
      intervention: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('interventions'); }
};