'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Outcome extends Model {
    // models/Outcome.js
      static associate(models) {
        if (models.Objective) {
          this.belongsTo(models.Objective, { foreignKey: 'objectiveId', as: 'LibraryObjective' });
        }
        // This is likely where it's failing because SpOutcome loads later
        if (models.SpOutcome) {
          this.hasMany(models.SpOutcome, { foreignKey: 'outcomeId', as: 'Selections' });
        }
        if (models.SpOutcomeIndicator) {
          this.hasMany(models.SpOutcomeIndicator, { 
            foreignKey: 'spOutcomeId', // Check if this should be outcomeId or spOutcomeId
            as: 'SelectedIndicators' 
          });
        }
      }
  }

  Outcome.init({
    objectiveId: { type: DataTypes.INTEGER, field: 'objective_id' },
    outcomeCode: { type: DataTypes.STRING, field: 'outcome_code' },
    outcomeName: { type: DataTypes.TEXT, field: 'outcome' }
  }, {
    sequelize,
    modelName: 'Outcome',
    tableName: 'outcomes',
    underscored: true
  });

  return Outcome;
};