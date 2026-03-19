// models/SpOutcomeIndicatorReport.js
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SpOutcomeIndicatorReport extends Model {
    static associate(models) {
      // NOW LIKED TO THE PARENT MDA REPORT
      this.belongsTo(models.MdaReport, { 
        foreignKey: 'mda_report_id', 
        as: 'ParentReport' 
      });

      this.belongsTo(models.SpOutcomeIndicator, { 
        foreignKey: 'sp_outcome_indicator_id', 
        as: 'Indicator' 
    });
    }
  }

  SpOutcomeIndicatorReport.init({
    // Changed from reportCallId to mdaReportId
    mdaReportId: { 
      type: DataTypes.INTEGER, 
      field: 'mda_report_id',
      allowNull: false
    },
    spOutcomeIndicatorId: { 
      type: DataTypes.INTEGER, 
      field: 'sp_outcome_indicator_id',
      allowNull: false 
    },
    actualValue: {
  type: DataTypes.DECIMAL(20, 2),
  field: 'actual_value',
  allowNull: false,
  get() {
    // CHANGE: Use 'actualValue' (the JS property), NOT 'actual_value' (the DB column)
    const val = this.getDataValue('actualValue'); 
    
    if (val === null || val === undefined) return null;
    
    const parsed = parseFloat(val);
    return isNaN(parsed) ? null : parsed;
  }
},
    remarks: { type: DataTypes.TEXT }
  }, {
    sequelize,
    modelName: 'SpOutcomeIndicatorReport',
    tableName: 'sp_outcome_indicator_reports',
    underscored: true
  });

  return SpOutcomeIndicatorReport;
};