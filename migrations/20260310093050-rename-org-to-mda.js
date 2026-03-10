'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    
    // 1. Table Rename
    if (tables.includes('organizations')) {
      await queryInterface.renameTable('organizations', 'mdas');
    }

    // 2. Column Rename
    try {
      const userTableDesc = await queryInterface.describeTable('users');
      if (userTableDesc.organization_id && !userTableDesc.mda_id) {
        await queryInterface.renameColumn('users', 'organization_id', 'mda_id');
      }
    } catch (e) { console.log('Column rename skipped'); }

    // 3. The Role Fix: Move from ENUM to TEXT, update, then back to ENUM
    try {
      // Set to TEXT temporarily to bypass ENUM validation
      await queryInterface.changeColumn('users', 'role', {
        type: Sequelize.TEXT,
        allowNull: true
      });

      // Update the data
      await queryInterface.sequelize.query("UPDATE users SET role = 'mda_admin' WHERE role = 'organization_admin'");

      // Set to new ENUM
      await queryInterface.changeColumn('users', 'role', {
        type: Sequelize.ENUM('npa_admin', 'mda_admin'),
        allowNull: false,
        defaultValue: 'mda_admin'
      });
    } catch (e) {
      console.log('Role modification error:', e.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Reverse logic if needed
  }
};