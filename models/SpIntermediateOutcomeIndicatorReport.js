'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SpIntermediateOutcomeIndicatorReport extends Model {
    static associate(models) {
      // 1. Link to the MDA's Quarterly Envelope (The Parent MdaReport)
      this.belongsTo(models.MdaReport, { 
        foreignKey: 'mda_report_id', 
        as: 'ParentReport' 
      });

      // 2. Link to the MDA's Intermediate Selection (The 5-year Plan target)
      this.belongsTo(models.SpIntermediateOutcomeIndicator, { 
        foreignKey: 'sp_intermediate_outcome_indicator_id', 
        as: 'Indicator' 
      });
    }
  }

  SpIntermediateOutcomeIndicatorReport.init({
    // Changed: Links this specific entry to the MDA's submission record
    mdaReportId: { 
      type: DataTypes.INTEGER, 
      field: 'mda_report_id',
      allowNull: false 
    },
    // Matches naming in sp_intermediate_outcome_indicators table
    spIntermediateOutcomeIndicatorId: { 
      type: DataTypes.INTEGER, 
      field: 'sp_intermediate_outcome_indicator_id',
      allowNull: false 
    },
    // The Snapshot Value (Actual progress recorded this quarter)
    actualValue: {
      type: DataTypes.DECIMAL(20, 2),
      field: 'actual_value',
      allowNull: false,
      get() {
        // Use the property name 'actualValue' instead of the column name
        const val = this.getDataValue('actualValue'); 
        
        if (val === null || val === undefined) return null;
        
        // Ensure we return a clean float for Pug to handle
        return parseFloat(val);
      }
    },
    // Progress notes or explanations for this specific indicator
    remarks: { 
      type: DataTypes.TEXT,
      allowNull: true 
    }
  }, {
    sequelize,
    modelName: 'SpIntermediateOutcomeIndicatorReport',
    tableName: 'sp_intermediate_outcome_indicator_reports',
    underscored: true
  });

  return SpIntermediateOutcomeIndicatorReport;
};