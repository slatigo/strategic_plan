'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('report_calls', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      plan_call_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'plan_calls', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      reporting_year: {
        type: Sequelize.STRING,
        allowNull: false
      },
      quarter: {
        type: Sequelize.ENUM('Q1', 'Q2', 'Q3', 'Q4'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      deadline: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Draft', 'Open', 'Closed'),
        defaultValue: 'Draft'
      },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('report_calls');
  }
};