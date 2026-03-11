'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SpIntermediateOutcomeIndicator extends Model {
    static associate(models) {
      this.belongsTo(models.IntermediateOutcomeIndicator, { foreignKey: 'intermediate_outcome_indicator_id', as: 'LibraryIndicator' });
      this.belongsTo(models.SpIntermediateOutcome, { foreignKey: 'sp_intermediate_outcome_id', as: 'SelectedIntermediate' });
      this.hasMany(models.SpIntermediateOutcomeIndicatorTarget, { foreignKey: 'sp_intermediate_outcome_indicator_id', as: 'Targets' });
    }
  }
  SpIntermediateOutcomeIndicator.init({
    intermediateOutcomeIndicatorId: { type: DataTypes.INTEGER, field: 'intermediate_outcome_indicator_id' },
    spIntermediateOutcomeId: { type: DataTypes.INTEGER, field: 'sp_intermediate_outcome_id' },
    adaptedIntermediateOutcomeIndicator: { type: DataTypes.STRING, field: 'adapted_intermediate_outcome_indicator' },
    responsibleOffice: { type: DataTypes.STRING, field: 'responsible_office' },
    planId: { type: DataTypes.INTEGER, field: 'plan_id' }
  }, { sequelize, modelName: 'SpIntermediateOutcomeIndicator', tableName: 'sp_intermediate_outcome_indicators', underscored: true });
  return SpIntermediateOutcomeIndicator;
};