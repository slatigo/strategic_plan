'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SpIntermediateOutcome extends Model {
    // models/sp_intermediate_outcome.js
      static associate(models) {
        if (models.SpOutcome) {
          this.belongsTo(models.SpOutcome, { foreignKey: 'spOutcomeId', as: 'SelectedOutcome' });
        }

        if (models.IntermediateOutcome) {
          this.belongsTo(models.IntermediateOutcome, { foreignKey: 'intermediateOutcomeId', as: 'LibraryIntermediate' });
        }

        if (models.SpIntervention) {
          this.hasMany(models.SpIntervention, { foreignKey: 'spIntermediateOutcomeId', as: 'SelectedInterventions' });
        }
        
        if (models.SpIntermediateOutcomeIndicator) {
          this.hasMany(models.SpIntermediateOutcomeIndicator, { foreignKey: 'spIntermediateOutcomeId', as: 'SelectedIndicators' });
        }
      }
  }

  SpIntermediateOutcome.init({
    // These property names (camelCase) are what associations should reference
    spOutcomeId: { 
      type: DataTypes.INTEGER, 
      field: 'sp_outcome_id',
      allowNull: false 
    },
    intermediateOutcomeId: { 
      type: DataTypes.INTEGER, 
      field: 'intermediate_outcome_id',
      allowNull: false 
    },
  }, {
    sequelize,
    modelName: 'SpIntermediateOutcome',
    tableName: 'sp_intermediate_outcomes',
    underscored: true,
  });

  return SpIntermediateOutcome;
};