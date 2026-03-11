'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class IntermediateOutcome extends Model {
    static associate(models) {
      this.belongsTo(models.Outcome, { foreignKey: 'outcome_id', as: 'LibraryOutcome' });
      this.hasMany(models.Intervention, { foreignKey: 'intermediate_outcome_id', as: 'Interventions' });
      this.hasMany(models.IntermediateOutcomeIndicator, { foreignKey: 'intermediate_outcome_id', as: 'Indicators' });
    }
  }
  IntermediateOutcome.init({
    outcomeId: { type: DataTypes.INTEGER, field: 'outcome_id' },
    intermediateOutcomeCode: { type: DataTypes.STRING, field: 'intermediate_outcome_code' },
    intermediateOutcome: { type: DataTypes.TEXT, field: 'intermediate_outcome' }
  }, { sequelize, modelName: 'IntermediateOutcome', tableName: 'intermediate_outcomes', underscored: true });
  return IntermediateOutcome;
};