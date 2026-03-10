'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('programmes', {
      id: { 
        allowNull: false, 
        autoIncrement: true, 
        primaryKey: true, 
        type: Sequelize.INTEGER 
      },
      programme_code: { 
        type: Sequelize.STRING, 
        allowNull: false, 
        unique: true 
      },
      programme_name: { 
        type: Sequelize.STRING, 
        allowNull: false 
      },
      programme_goal: { 
        type: Sequelize.TEXT, // Using TEXT instead of STRING for longer descriptions
        allowNull: true 
      },
      created_at: { 
        allowNull: false, 
        type: Sequelize.DATE, 
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') 
      },
      updated_at: { 
        allowNull: false, 
        type: Sequelize.DATE, 
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') 
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('programmes');
  }
};