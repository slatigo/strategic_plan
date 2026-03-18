'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SpOutcome extends Model {
    static associate(models) {
      // Library link
      if (models.Outcome) {
        this.belongsTo(models.Outcome, { foreignKey: 'outcomeId', as: 'LibraryOutcome' });
      }

      // Link to Parent Objective
      if (models.SpObjective) {
        this.belongsTo(models.SpObjective, { foreignKey: 'spObjectiveId', as: 'SelectedObjective' });
      }

      // Match controller 'as: SelectedIntermediates'
      if (models.SpIntermediateOutcome) {
        this.hasMany(models.SpIntermediateOutcome, { 
          foreignKey: 'spOutcomeId', 
          as: 'SelectedIntermediates' 
        });
      }

      // Match controller 'as: SelectedIndicators'
      if (models.SpOutcomeIndicator) {
        this.hasMany(models.SpOutcomeIndicator, { 
          foreignKey: 'spOutcomeId', 
          as: 'SelectedIndicators' 
        });
      }
    }
  }

  SpOutcome.init({
    // CORRECT: Matches your 'sp_objective_id' column in SQL
    spObjectiveId: { 
      type: DataTypes.INTEGER, 
      field: 'sp_objective_id',
      allowNull: false 
    },
    // CORRECT: Matches your 'outcome_id' column in SQL
    outcomeId: { 
      type: DataTypes.INTEGER, 
      field: 'outcome_id',
      allowNull: false 
    }
    // planId REMOVED because it's not in your sp_outcomes table
  }, {
    sequelize,
    modelName: 'SpOutcome',
    tableName: 'sp_outcomes',
    underscored: true
  });

  return SpOutcome;
};