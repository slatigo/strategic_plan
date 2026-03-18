'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('NationalValues', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      indicator_code: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'NationalAlignments',
          key: 'indicator_code'
        },
        onDelete: 'CASCADE'
      },
      target_year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      // This holds whatever is in that Excel column (1:09, 500000, 85%, etc.)
      value: {
        type: Sequelize.STRING, 
        allowNull: false
      }
      // No timestamps, no value_type, no redundant columns.
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('NationalValues');
  }
};