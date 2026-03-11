'use strict';
const { Model } = require('sequelize'); // REMOVED: DataTypes from here

module.exports = (sequelize, DataTypes) => { // ADDED: DataTypes here
  class SpOutcomeIndicator extends Model {
      static associate(models) {
        // 1. Link back to the parent selection
        this.belongsTo(models.SpOutcome, { 
            foreignKey: 'sp_outcome_id', 
            as: 'SelectedOutcome' 
        });

        // 2. Link to the library/standard definition
        this.belongsTo(models.OutcomeIndicator, { 
            foreignKey: 'outcome_indicator_id', 
            as: 'LibraryIndicator' 
        });

        // 3. Link to the targets (yearly values)
        this.hasMany(models.SpOutcomeIndicatorTarget, {
            foreignKey: 'sp_outcome_indicator_id',
            as: 'Targets'
        });
    }
  }

  SpOutcomeIndicator.init({
    outcomeIndicatorId: { type: DataTypes.INTEGER, field: 'outcome_indicator_id' },
    spOutcomeId: { type: DataTypes.INTEGER, field: 'sp_outcome_id' },
    adaptedOutcomeIndicator: { type: DataTypes.STRING, field: 'adapted_outcome_indicator' },
    responsibleOffice: { type: DataTypes.STRING, field: 'responsible_office' },
    planId: { type: DataTypes.INTEGER, field: 'plan_id' }
  }, { 
    sequelize, 
    modelName: 'SpOutcomeIndicator', 
    tableName: 'sp_outcome_indicators', 
    underscored: true 
  });

  return SpOutcomeIndicator;
};