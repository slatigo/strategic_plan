'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class PlanCall extends Model {
    static associate(models) {
      // Inverse relationship
      this.hasMany(models.ReportCall, { 
        foreignKey: 'plan_call_id', 
        as: 'Reports' 
      });
    }
  }

  PlanCall.init({
    fy: { 
      type: DataTypes.INTEGER, // Changed to INTEGER to store 2025
      allowNull: false,
      validate: {
        min: {
          args: [2000],
          msg: "Fiscal Year must be a valid 4-digit year"
        },
        max: {
          args: [2100],
          msg: "Year is out of range"
        }
      } 
    },
    description: { 
      type: DataTypes.TEXT, 
      allowNull: false 
    },
    deadline: { 
      type: DataTypes.DATEONLY, 
      allowNull: false 
    },
    status: { 
      type: DataTypes.ENUM('Open', 'Closed'), 
      defaultValue: 'Open' 
    }
  }, {
    sequelize,
    modelName: 'PlanCall',
    tableName: 'plan_calls',
    underscored: true
  });

  return PlanCall;
};