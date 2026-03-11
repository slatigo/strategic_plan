'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sp_intermediate_outcomes', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      sp_outcome_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sp_outcomes', key: 'id' },
        onDelete: 'CASCADE'
      },
      intermediate_outcome_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'intermediate_outcomes', key: 'id' },
        onDelete: 'CASCADE'
      },
      plan_id: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addConstraint('sp_intermediate_outcomes', {
      fields: ['sp_outcome_id', 'intermediate_outcome_id'],
      type: 'unique',
      name: 'unique_sp_intermediate_outcome'
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('sp_intermediate_outcomes'); }
};