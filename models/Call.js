// models/call.js
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Call extends Model {}
  Call.init({
    fy: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    deadline: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM('Open', 'Closed'), defaultValue: 'Open' }
  }, {
    sequelize,
    modelName: 'Call',
    tableName: 'calls',
    underscored: true
  });
  return Call;
};