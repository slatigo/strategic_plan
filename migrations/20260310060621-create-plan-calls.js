'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('plan_calls', {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      fy: {
        type: Sequelize.INTEGER(11),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT, // Changed 'plan' to 'description' as requested
        allowNull: false
      },
      deadline: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      // Sequelize requires these by default unless disabled
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('plan_calls');
  }
};