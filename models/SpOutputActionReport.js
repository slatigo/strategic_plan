'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SpOutputActionReport extends Model {
    static associate(models) {
      // 1. Link to the MDA's Quarterly Envelope (The Parent Report)
      // This allows you to check if the whole submission is 'Approved' or 'Draft'
      this.belongsTo(models.MdaReport, { 
        foreignKey: 'mda_report_id', 
        as: 'ParentReport' 
      });

      // 2. Link to the Planned Action (The Budget source/Target)
      this.belongsTo(models.SpOutputAction, { 
        foreignKey: 'sp_output_action_id', 
        as: 'Action' 
      });
    }
  }

  SpOutputActionReport.init({
    // Changed: Points to the MDA's specific submission record for the quarter
    mdaReportId: { 
      type: DataTypes.INTEGER, 
      field: 'mda_report_id',
      allowNull: false 
    },
    // Foreign key to the original planned action in the 5-year plan
    spOutputActionId: { 
      type: DataTypes.INTEGER, 
      field: 'sp_output_action_id',
      allowNull: false 
    },
    // Financial Snapshot: Amount spent during this specific quarter
    actualExpenditure: {
      type: DataTypes.DECIMAL(20, 2),
      field: 'actual_expenditure',
      allowNull: false,
      defaultValue: 0.00,
      get() {
        // FIX: Change 'actual_expenditure' to 'actualExpenditure'
        const val = this.getDataValue('actualExpenditure');
        return val === null ? null : parseFloat(val);
      }
    },
    // Narrative for the financial performance/justification
    remarks: { 
      type: DataTypes.TEXT,
      allowNull: true 
    }
  }, {
    sequelize,
    modelName: 'SpOutputActionReport',
    tableName: 'sp_output_action_reports',
    underscored: true
  });

  return SpOutputActionReport;
};