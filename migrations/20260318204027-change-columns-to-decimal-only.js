'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. CLEAR NON-NUMERIC DATA
    // MySQL cannot convert '32/54' or '' to a DECIMAL. 
    // This query sets any value that isn't a simple number to NULL first.
    await queryInterface.sequelize.query(`
      UPDATE nationalalignments 
      SET baseline_value = NULL 
      WHERE baseline_value LIKE '%/%' OR TRIM(baseline_value) = '';
    `);

    await queryInterface.sequelize.query(`
      UPDATE nationalvalues 
      SET value = NULL 
      WHERE value LIKE '%/%' OR TRIM(value) = '';
    `);

    // 2. CHANGE COLUMN TYPE
    // Now that the data is "clean" (numbers or NULL), the type change will work.
    await queryInterface.changeColumn('nationalalignments', 'baseline_value', {
      type: Sequelize.DECIMAL(20, 2),
      allowNull: true
    });

    await queryInterface.changeColumn('nationalvalues', 'value', {
      type: Sequelize.DECIMAL(20, 2),
      allowNull: true
    });

    // NOTE: No multiplication, no dropping columns. Just the type change.
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('nationalalignments', 'baseline_value', { type: Sequelize.STRING });
    await queryInterface.changeColumn('nationalvalues', 'value', { type: Sequelize.STRING });
  }
};