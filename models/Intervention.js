'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Intervention extends Model {
    static associate(models) {
      this.belongsTo(models.IntermediateOutcome, { foreignKey: 'intermediate_outcome_id', as: 'LibraryIntermediate' });
      this.hasMany(models.Output, { foreignKey: 'intervention_id', as: 'LibraryOutputs' });
    }
  }
  Intervention.init({
    interventionCode: { type: DataTypes.STRING, field: 'intervention_code' },
    intermediateOutcomeId: { type: DataTypes.INTEGER, field: 'intermediate_outcome_id' },
    intervention: { type: DataTypes.TEXT, allowNull: false }
  }, { sequelize, modelName: 'Intervention', tableName: 'interventions', underscored: true });
  return Intervention;
};