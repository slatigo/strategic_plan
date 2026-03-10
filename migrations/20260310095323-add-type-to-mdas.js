'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('mdas', 'type', {
      type: Sequelize.ENUM('Ministry', 'Department', 'Agency'),
      allowNull: false,
      defaultValue: 'Agency'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('mdas', 'type');
  }
};