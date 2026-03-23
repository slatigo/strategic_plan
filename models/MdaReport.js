'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class MdaReport extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 1. Parent Relationships
      // We use the attribute names (camelCase) as the foreignKey
      this.belongsTo(models.ReportCall, { 
        foreignKey: 'reportCallId', 
        as: 'Call' 
      });
      
      this.belongsTo(models.Mda, { 
        foreignKey: 'mdaId', 
        as: 'Mda' 
      });
      
      this.belongsTo(models.User, { 
        foreignKey: 'userId', 
        as: 'Reporter' 
      });

      // 2. Child Relationships
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
      this.hasMany(models.ReportComment, {
        foreignKey: 'report_id',
        as: 'Comments' // This MUST match the 'as' you used in the include
      });
    }
  }

  MdaReport.init({
    // Primary Key
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    // Foreign Key: Matches 'report_call_id' in MySQL
    reportCallId: { 
      type: DataTypes.INTEGER, 
      field: 'report_call_id', 
      allowNull: false 
    },
    // Foreign Key: Matches 'mda_id' in MySQL
    mdaId: { 
      type: DataTypes.INTEGER, 
      field: 'mda_id', 
      allowNull: false 
    },
    // Foreign Key: Matches 'user_id' in MySQL
    userId: { 
      type: DataTypes.INTEGER, 
      field: 'user_id', 
      allowNull: false 
    },
    // Status Enum matching your DB exactly
    status: { 
      type: DataTypes.ENUM('Draft', 'Submitted', 'Approved', 'Needs Revision'), 
      defaultValue: 'Draft' 
    },
    // Date field: Matches 'submission_date' in MySQL
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
    // underscored: true automatically maps createdAt to created_at
    underscored: true,
    // Explicitly handle timestamps if they exist
    timestamps: true
  });

  return MdaReport;
};