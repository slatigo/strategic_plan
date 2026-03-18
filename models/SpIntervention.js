'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SpIntervention extends Model {
    static associate(models) {
      this.belongsTo(models.Intervention, { foreignKey: 'interventionId', as: 'LibraryIntervention' });
      this.belongsTo(models.SpIntermediateOutcome, { foreignKey: 'spIntermediateOutcomeId', as: 'SelectedIntermediate' });
      this.hasMany(models.SpOutput, { foreignKey: 'spInterventionId', as: 'SelectedOutputs' });
    }
  }
  SpIntervention.init({
    spIntermediateOutcomeId: { type: DataTypes.INTEGER, field: 'sp_intermediate_outcome_id' },
    interventionId: { type: DataTypes.INTEGER, field: 'intervention_id' },
  }, { sequelize, modelName: 'SpIntervention', tableName: 'sp_interventions', underscored: true });
  return SpIntervention;
};