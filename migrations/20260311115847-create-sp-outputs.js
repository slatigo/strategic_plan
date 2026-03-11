'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sp_outputs', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      sp_intervention_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sp_interventions', key: 'id' },
        onDelete: 'CASCADE'
      },
      output_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'outputs', key: 'id' },
        onDelete: 'CASCADE'
      },
      plan_id: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addConstraint('sp_outputs', {
      fields: ['sp_intervention_id', 'output_id'],
      type: 'unique',
      name: 'unique_sp_output'
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('sp_outputs'); }
};