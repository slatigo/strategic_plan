'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop if exists to ensure a clean slate during retries
    await queryInterface.dropTable('strategic_plans').catch(() => {});

    await queryInterface.createTable('strategic_plans', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      call_id: { type: Sequelize.INTEGER, allowNull: false },
      mda_id: { type: Sequelize.INTEGER, allowNull: false },
      user_id: { type: Sequelize.INTEGER, allowNull: false },
      programme_id: { type: Sequelize.INTEGER, allowNull: true },
      
      // THE MISSING COLUMNS
      npa_admin: { type: Sequelize.INTEGER, allowNull: true }, 
      remarks: { type: Sequelize.TEXT, allowNull: true },
      submission_date: { type: Sequelize.DATE, allowNull: true },
      
      status: { 
        type: Sequelize.ENUM('Draft', 'Submitted', 'Pending Correction', 'Approved'), 
        defaultValue: 'Draft' 
      },
      recorded: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // Add your constraints back here (keep the try/catch we used earlier)
    // ... (Your addConstraint logic for programme_id, mda_id, and call_id)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('strategic_plans');
  }
};