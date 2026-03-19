'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mda_reports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      report_call_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'report_calls', // Ensure this matches your actual table name
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      mda_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'mdas', // Ensure this matches your actual table name
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.ENUM('Draft', 'Submitted', 'Approved', 'Needs Revision'),
        defaultValue: 'Draft'
      },
      submission_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      remarks: {
        type: Sequelize.TEXT,
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

    // Prevent duplicate reports for the same MDA in the same Quarter
    await queryInterface.addIndex('mda_reports', ['report_call_id', 'mda_id'], {
      unique: true,
      name: 'mda_report_unique_constraint'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('mda_reports');
  }
};