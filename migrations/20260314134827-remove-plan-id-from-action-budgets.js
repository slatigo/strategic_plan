'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('sp_output_action_budgets', 'plan_id');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('sp_output_action_budgets', 'plan_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  }
};