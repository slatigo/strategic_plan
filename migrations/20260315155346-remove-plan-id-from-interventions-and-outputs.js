'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
    
    // Remove from sp_outputs
    await queryInterface.removeColumn('sp_outputs', 'plan_id');
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback logic: Add columns back as nullable
    
    await queryInterface.addColumn('sp_outputs', 'plan_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  }
};