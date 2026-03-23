'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Modify plan_id to be NULLABLE
    // We must pass the full definition including the existing Foreign Key logic
    await queryInterface.changeColumn('plan_comments', 'plan_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // The critical change
      references: {
        model: 'strategic_plans',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });

    // 2. Add the report_id column
    await queryInterface.addColumn('plan_comments', 'report_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'mda_reports', // Ensure this matches your actual Reports table name
        key: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Reverse adding report_id
    await queryInterface.removeColumn('plan_comments', 'report_id');

    // Reverse making plan_id nullable
    await queryInterface.changeColumn('plan_comments', 'plan_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'strategic_plans',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });
  }
};