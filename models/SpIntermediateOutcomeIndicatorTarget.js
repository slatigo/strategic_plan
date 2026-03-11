'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SpIntermediateOutcomeIndicatorTarget extends Model {
    static associate(models) {
      this.belongsTo(models.SpIntermediateOutcomeIndicator, { foreignKey: 'sp_intermediate_outcome_indicator_id', as: 'Indicator' });
    }
  }
  SpIntermediateOutcomeIndicatorTarget.init({
    fy: { type: DataTypes.STRING(20), allowNull: false },
    spIntermediateOutcomeIndicatorId: { type: DataTypes.INTEGER, field: 'sp_intermediate_outcome_indicator_id' },
    val: { type: DataTypes.STRING(40) },
    planId: { type: DataTypes.INTEGER, field: 'plan_id' }
  }, { sequelize, modelName: 'SpIntermediateOutcomeIndicatorTarget', tableName: 'sp_intermediate_outcome_indicator_targets', underscored: true });
  return SpIntermediateOutcomeIndicatorTarget;
};