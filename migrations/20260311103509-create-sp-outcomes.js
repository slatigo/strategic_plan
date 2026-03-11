'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sp_outcomes', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      sp_objective_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sp_objectives', key: 'id' },
        onDelete: 'CASCADE'
      },
      outcome_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'outcomes', key: 'id' },
        onDelete: 'CASCADE'
      },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addConstraint('sp_outcomes', {
      fields: ['sp_objective_id', 'outcome_id'],
      type: 'unique',
      name: 'unique_sp_objective_outcome'
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('sp_outcomes'); }
};