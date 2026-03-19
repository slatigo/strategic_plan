'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ReportCall extends Model {
    static associate(models) {
      // 1. Existing: Link to the 5-year Plan cycle
      this.belongsTo(models.PlanCall, { 
        foreignKey: 'plan_call_id', 
        as: 'MasterPlan' 
      });

      // 2. ADD THIS: Link to the MDA Submissions
      // This allows us to use .findAll({ include: ['MdaSubmissions'] })
      this.hasMany(models.MdaReport, { 
        foreignKey: 'reportCallId', // Must match the camelCase key in MdaReport model
        as: 'MdaSubmissions' 
      });
    }
  }

  ReportCall.init({
    planCallId: {
      type: DataTypes.INTEGER,
      field: 'plan_call_id',
      allowNull: false
    },
    // The specific FY within the 5-year cycle (e.g., 2026/2027)
    reportingYear: { 
      type: DataTypes.STRING(4), // Just store "2025"
      allowNull: false,
      field: 'reporting_year'
    },
    // Snapshots: Q1, Q2, Q3, or the final Q4
    quarter: {
      type: DataTypes.ENUM('Q1', 'Q2', 'Q3', 'Q4'),
      allowNull: false
    },
    description: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    deadline: { 
      type: DataTypes.DATEONLY, 
      allowNull: false 
    },
    // 'Draft' until the admin hits "Publish"
    status: { 
      type: DataTypes.ENUM('Draft', 'Open', 'Closed'), 
      defaultValue: 'Draft' 
    }
  }, {
    sequelize,
    modelName: 'ReportCall',
    tableName: 'report_calls',
    underscored: true
  });

  // Helper virtual field to get a clean name like "2026 - Q1"
  // You can use this in your Pug file as #{call.name}
  // Helper virtual field to get a clean name like "FY 2025/26 - Q1"
  ReportCall.prototype.getName = function() {
    const nextYear = (parseInt(this.reportingYear) + 1).toString().slice(-2);
    return `FY ${this.reportingYear}/${nextYear} - ${this.quarter}`;
  };

  return ReportCall;
};