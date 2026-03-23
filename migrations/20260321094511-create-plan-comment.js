'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('plan_comments', { // Lowercase snake_case is safer
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      planId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'plan_id', // Add this to match your underscored: true pattern
        references: { 
          model: 'strategic_plans', // Matches your StrategicPlan model tableName
          key: 'id' 
        },
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: { 
          model: 'users', // Check your User model tableName, usually 'users'
          key: 'id' 
        }
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      statusAtTime: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'status_at_time'
      },
      isAdminComment: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: 'is_admin_comment'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'created_at'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'updated_at'
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('plan_comments');
  }
};