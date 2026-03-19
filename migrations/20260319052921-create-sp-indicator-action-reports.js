'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Outcome Indicator Reports
    await queryInterface.createTable('sp_outcome_indicator_reports', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      report_call_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'report_calls', key: 'id' } },
      sp_outcome_indicator_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'sp_outcome_indicators', key: 'id' } },
      actual_value: { type: Sequelize.DECIMAL(20, 2), allowNull: false },
      remarks: { type: Sequelize.TEXT },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    });

    // 2. Intermediate Outcome Indicator Reports
    await queryInterface.createTable('sp_intermediate_outcome_indicator_reports', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      report_call_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'report_calls', key: 'id' } },
      sp_intermediate_outcome_indicator_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: { model: 'sp_intermediate_outcome_indicators', key: 'id' },
        name: 'fk_sp_inter_indicator_report' // Avoid long name issues in some DBs
      },
      actual_value: { type: Sequelize.DECIMAL(20, 2), allowNull: false },
      remarks: { type: Sequelize.TEXT },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    });

    // 3. Output Indicator Reports
    await queryInterface.createTable('sp_output_indicator_reports', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      report_call_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'report_calls', key: 'id' } },
      sp_output_indicator_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'sp_output_indicators', key: 'id' } },
      actual_value: { type: Sequelize.DECIMAL(20, 2), allowNull: false },
      remarks: { type: Sequelize.TEXT },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    });

    // 4. Output Action Reports (Financial Expenditure)
    await queryInterface.createTable('sp_output_action_reports', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      report_call_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'report_calls', key: 'id' } },
      sp_output_action_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'sp_output_actions', key: 'id' } },
      actual_expenditure: { type: Sequelize.DECIMAL(20, 2), allowNull: false, defaultValue: 0.00 },
      remarks: { type: Sequelize.TEXT },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('sp_output_action_reports');
    await queryInterface.dropTable('sp_output_indicator_reports');
    await queryInterface.dropTable('sp_intermediate_outcome_indicator_reports');
    await queryInterface.dropTable('sp_outcome_indicator_reports');
  }
};