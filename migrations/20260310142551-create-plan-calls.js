'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('plan_calls', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fy: {
        type: Sequelize.STRING(20),
        allowNull: false
        // Stores "2026/2027"
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      deadline: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Open', 'Closed'),
        defaultValue: 'Open'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('plan_calls');
    // If using Postgres, you may need to drop the ENUM type explicitly:
    // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_plan_calls_status";');
  }
};