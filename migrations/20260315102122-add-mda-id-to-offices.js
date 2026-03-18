'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Offices', 'mda_id', {
      type: Sequelize.INTEGER,
      allowNull: false, // Set to true if you already have data in the table, then populate it and set to false
      references: {
        model: 'mdas', // Ensure this matches your actual MDA table name (usually lowercase/plural)
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Offices', 'mda_id');
  }
};