'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('NationalAlignments', {
      // The Primary Key used to link everything
      indicator_code: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
      },
      // Specifically for the National Baseline (can be null for Actions)
      baseline_value: {
        type: Sequelize.STRING,
        allowNull: true
      }
      // Note: No timestamps (createdAt/updatedAt) to keep it clean
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('NationalAlignments');
  }
};