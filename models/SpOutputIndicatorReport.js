'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SpOutputIndicatorReport extends Model {
    static associate(models) {
      // 1. Link to the MDA's Quarterly Envelope (The Parent Report)
      this.belongsTo(models.MdaReport, { 
        foreignKey: 'mda_report_id', 
        as: 'ParentReport' 
      });

      // 2. Link to the MDA's Output Selection (The 5-year Plan target)
      this.belongsTo(models.SpOutputIndicator, { 
        foreignKey: 'sp_output_indicator_id', 
        as: 'Indicator' 
      });
    }
  }

  SpOutputIndicatorReport.init({
    // Changed to link to the MDA's submission record
    mdaReportId: { 
      type: DataTypes.INTEGER, 
      field: 'mda_report_id',
      allowNull: false 
    },
    // Matches naming in sp_output_indicators table
    spOutputIndicatorId: { 
      type: DataTypes.INTEGER, 
      field: 'sp_output_indicator_id',
      allowNull: false 
    },
    // The Snapshot "Actual" Value
    actualValue: {
        type: DataTypes.DECIMAL(20, 2),
        field: 'actual_value',
        allowNull: false,
        get() {
          // Always use the property name defined in the model, NOT the column name
          const val = this.getDataValue('actualValue'); 
          return val === null ? null : parseFloat(val);
        }
      },
    remarks: { 
      type: DataTypes.TEXT,
      allowNull: true 
    }
  }, {
    sequelize,
    modelName: 'SpOutputIndicatorReport',
    tableName: 'sp_output_indicator_reports',
    underscored: true
  });

  return SpOutputIndicatorReport;
};