'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => { // Accept DataTypes as 2nd arg
  class IntermediateOutcome extends Model {
    static associate(models) {
      this.belongsTo(models.Outcome, { foreignKey: 'outcomeId', as: 'LibraryOutcome' });
      this.hasMany(models.Intervention, { foreignKey: 'intermediateOutcomeId', as: 'Interventions' });
      this.hasMany(models.IntermediateOutcomeIndicator, { foreignKey: 'intermediateOutcomeId', as: 'Indicators' });
    }
  }
  IntermediateOutcome.init({
    outcomeId: { type: DataTypes.INTEGER, field: 'outcome_id' },
    intermediateOutcomeCode: { type: DataTypes.STRING, field: 'intermediate_outcome_code' },
    intermediateOutcome: { type: DataTypes.TEXT, field: 'intermediate_outcome' }
  }, { 
    sequelize, 
    modelName: 'IntermediateOutcome', 
    tableName: 'intermediate_outcomes', 
    underscored: true 
  });
  return IntermediateOutcome;
};