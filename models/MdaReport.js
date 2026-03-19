'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class MdaReport extends Model {
    static associate(models) {
      // 1. Parent Relationships
      this.belongsTo(models.ReportCall, { foreignKey: 'reportCallId', as: 'Call' });
      this.belongsTo(models.Mda, { foreignKey: 'mdaId', as: 'Mda' });
      this.belongsTo(models.User, { foreignKey: 'userId', as: 'Reporter' });

      // 2. Child Relationships (One of each type)
      this.hasMany(models.SpOutcomeIndicatorReport, { 
        foreignKey: 'mdaReportId', 
        as: 'OutcomeEntries' 
      });
      this.hasMany(models.SpIntermediateOutcomeIndicatorReport, { 
        foreignKey: 'mdaReportId', 
        as: 'IntermediateEntries' 
      });
      this.hasMany(models.SpOutputIndicatorReport, { 
        foreignKey: 'mdaReportId', 
        as: 'OutputEntries' 
      });
      this.hasMany(models.SpOutputActionReport, { 
        foreignKey: 'mdaReportId', 
        as: 'ActionEntries' 
      });
    }
  }

  MdaReport.init({
    reportCallId: { 
      type: DataTypes.INTEGER, 
      field: 'report_call_id', 
      allowNull: false 
    },
    mdaId: { 
      type: DataTypes.INTEGER, 
      field: 'mda_id', 
      allowNull: false 
    },
    userId: { 
      type: DataTypes.INTEGER, 
      field: 'user_id', 
      allowNull: false 
    },
    status: { 
      type: DataTypes.ENUM('Draft', 'Submitted', 'Approved', 'Needs Revision'), 
      defaultValue: 'Draft' 
    },
    submissionDate: { 
      type: DataTypes.DATE, 
      field: 'submission_date' 
    },
    remarks: { 
      type: DataTypes.TEXT 
    }
  }, {
    sequelize,
    modelName: 'MdaReport',
    tableName: 'mda_reports',
    underscored: true
  });

  return MdaReport;
};