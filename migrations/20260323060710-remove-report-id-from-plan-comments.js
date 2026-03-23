'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('plan_comments', 'report_id');
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('plan_comments', 'report_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'mda_reports', key: 'id' }
    });
  }
};