'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Remove from sp_output_actions
    await queryInterface.removeColumn('sp_output_actions', 'plan_id');

  },

  down: async (queryInterface, Sequelize) => {
    // Rollback: Add them back as nullable to avoid errors
    await queryInterface.addColumn('sp_output_actions', 'plan_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  }
};