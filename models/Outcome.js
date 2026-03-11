'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Outcome extends Model {
    static associate(models) {
      this.belongsTo(models.Objective, { foreignKey: 'objectiveId', as: 'LibraryObjective' });
      this.hasMany(models.SpOutcome, { foreignKey: 'outcomeId', as: 'Selections' });
      this.hasMany(models.SpOutcomeIndicator, { 
        foreignKey: 'sp_outcome_id', 
        as: 'SelectedIndicators' 
      });
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