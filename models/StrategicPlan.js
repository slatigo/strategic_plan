'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class StrategicPlan extends Model {
    static associate(models) {
      // Links the plan to the specific Fiscal Year Call
      this.belongsTo(models.PlanCall, { foreignKey: 'callId', as: 'Call' });
      
      // Links to the MDA (Renamed from org_id to mda_id to match your system)
      this.belongsTo(models.Mda, { foreignKey: 'mdaId', as: 'Mda' });
      
      // The Planner (MDA User) who initiated the plan
      this.belongsTo(models.User, { foreignKey: 'userId', as: 'Planner' });
      
      // The NPA Admin who is currently reviewing/approving
      this.belongsTo(models.User, { foreignKey: 'npaAdminId', as: 'Reviewer' });
      
      // The history of back-and-forth comments
      this.hasMany(models.PlanReview, { foreignKey: 'planId', as: 'Reviews' });

      // Links to the existing PIAP Programmes table
      this.belongsTo(models.Programme, { 
        foreignKey: 'programmeId', 
        as: 'Programme' 
      });
    }
  }

  StrategicPlan.init({
    // Foreign Keys (Mapped to snake_case DB columns)
    callId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'call_id'
    },
    mdaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'mda_id' // Matches renamed column
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    programmeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'programme_id'
    },
    npaAdminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'npa_admin' // Keeping your existing column name 'npa_admin'
    },

    // Status and Data Fields
    status: {
      type: DataTypes.ENUM('Draft', 'Submitted', 'Pending Correction', 'Approved'),
      defaultValue: 'Draft'
    },
    submissionDate: {
      type: DataTypes.DATE,
      field: 'submission_date'
    },
    remarks: {
      type: DataTypes.TEXT
    },
    recorded: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'StrategicPlan',
    tableName: 'strategic_plans',
    underscored: true,
    timestamps: false 
  });

  return StrategicPlan;
};