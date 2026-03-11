'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class IntermediateOutcomeIndicator extends Model {
    static associate(models) {
      this.belongsTo(models.IntermediateOutcome, { foreignKey: 'intermediate_outcome_id', as: 'ParentIntermediate' });
    }
  }
  IntermediateOutcomeIndicator.init({
    intermediateOutcomeId: { type: DataTypes.INTEGER, field: 'intermediate_outcome_id' },
    IndicatorCode: { type: DataTypes.STRING, field: 'indicator_code' },
    Indicator: { type: DataTypes.TEXT, field: 'indicator' },
    unitOfMeasure: { 
      type: DataTypes.STRING(50), 
      field: 'unit_of_measure' // Maps to the new DB column
    }
  }, { sequelize, modelName: 'IntermediateOutcomeIndicator', tableName: 'intermediate_outcome_indicators', underscored: true });
  return IntermediateOutcomeIndicator;
};