'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class PlanCall extends Model {}

  PlanCall.init({
    fy: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      validate: {
        is: {
          args: /^\d{4}\/\d{4}$/, 
          msg: "Fiscal Year must be in the format YYYY/YYYY (e.g., 2026/2027)"
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