'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SpOutcomeIndicatorTarget extends Model {
    static associate(models) {
    if (models.SpOutcomeIndicator) {
      this.belongsTo(models.SpOutcomeIndicator, { 
        foreignKey: 'spOutcomeIndicatorId', 
        as: 'Indicator' 
      });
    }
  }
  }
  SpOutcomeIndicatorTarget.init({
    fy: { type: DataTypes.STRING(20), allowNull: false },
    spOutcomeIndicatorId: { type: DataTypes.INTEGER, field: 'sp_outcome_indicator_id' },
    val: { type: DataTypes.STRING(255) },
  }, { sequelize, modelName: 'SpOutcomeIndicatorTarget', tableName: 'sp_outcome_indicator_targets', underscored: true });
  return SpOutcomeIndicatorTarget;
};