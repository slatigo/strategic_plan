'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add the 'name' column
    await queryInterface.addColumn('users', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      after: 'id' // Places it right after ID
    });

    // 2. Remove the 'username' column
    await queryInterface.removeColumn('users', 'username');

    // 3. Optional: Ensure 'organization_admin' matches your model ENUM
    // If you changed 'org_admin' to 'organization_admin', update it here.
  },

  async down(queryInterface, Sequelize) {
    // To undo: Add username back and remove name
    await queryInterface.addColumn('users', 'username', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.removeColumn('users', 'name');
  }
};