'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SpOutcome extends Model {
    static associate(models) {
        // 1. Link to Indicators (The ones we just fixed)
        this.hasMany(models.SpOutcomeIndicator, { 
          foreignKey: 'sp_outcome_id', 
          as: 'SelectedIndicators' 
        });

        // 2. Link to the Library definition (Standard info)
        this.belongsTo(models.Outcome, {
          foreignKey: 'outcome_id',
          as: 'LibraryOutcome'
        });

        // 3. THE ADDITION: Link to Intermediate Outcomes
        // This solves "SpIntermediateOutcome is not associated to SpOutcome!"
        this.hasMany(models.SpIntermediateOutcome, {
          foreignKey: 'sp_outcome_id',
          as: 'SelectedIntermediates'
        });
      }
    }

  SpOutcome.init({
    spObjectiveId: { type: DataTypes.INTEGER, field: 'sp_objective_id' },
    outcomeId: { type: DataTypes.INTEGER, field: 'outcome_id' }
  }, {
    sequelize,
    modelName: 'SpOutcome',
    tableName: 'sp_outcomes',
    underscored: true
  });

  return SpOutcome;
};