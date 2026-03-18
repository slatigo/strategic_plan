'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('budgetsources', 'mda_id', {
      type: Sequelize.INTEGER,
      allowNull: false, // If table is not empty, set to true first, populate, then set to false
      references: {
        model: 'mdas', // Ensure this matches your MDA table name
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('budgetsources', 'mda_id');
  }
};