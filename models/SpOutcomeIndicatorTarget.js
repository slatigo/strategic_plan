'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SpOutcomeIndicatorTarget extends Model {
    static associate(models) {
      this.belongsTo(models.SpOutcomeIndicator, { foreignKey: 'sp_outcome_indicator_id', as: 'Indicator' });
    }
  }
  SpOutcomeIndicatorTarget.init({
    fy: { type: DataTypes.STRING(20), allowNull: false },
    spOutcomeIndicatorId: { type: DataTypes.INTEGER, field: 'sp_outcome_indicator_id' },
    val: { type: DataTypes.STRING(255) },
    planId: { type: DataTypes.INTEGER, field: 'plan_id' }
  }, { sequelize, modelName: 'SpOutcomeIndicatorTarget', tableName: 'sp_outcome_indicator_targets', underscored: true });
  return SpOutcomeIndicatorTarget;
};