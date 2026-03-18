'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SpOutcomeIndicator extends Model {
    static associate(models) {
      this.belongsTo(models.OutcomeIndicator, { 
        foreignKey: 'outcomeIndicatorId', 
        as: 'LibraryIndicator' 
      });

      this.belongsTo(models.SpOutcome, { 
        foreignKey: 'spOutcomeId', 
        as: 'SelectedOutcome' 
      });

      this.hasMany(models.SpOutcomeIndicatorTarget, { 
        foreignKey: 'spOutcomeIndicatorId', 
        as: 'Targets' 
      });

      // Align this with your new "Responsible Office" logic
      if (models.Office) {
        this.belongsTo(models.Office, {
          foreignKey: 'responsibleOfficeId',
          as: 'ResponsibleOffice'
        });
      }
    }
  }

  SpOutcomeIndicator.init({
    outcomeIndicatorId: { type: DataTypes.INTEGER, field: 'outcome_indicator_id' },
    spOutcomeId: { type: DataTypes.INTEGER, field: 'sp_outcome_id' },
    adaptedOutcomeIndicator: { type: DataTypes.TEXT, field: 'adapted_outcome_indicator' },
    baselineValue: { type: DataTypes.STRING, field: 'baseline_value' },
    responsibleOfficeId: { type: DataTypes.INTEGER, field: 'responsible_office_id' },
    dataSource: { type: DataTypes.TEXT, field: 'data_source' }
  }, { 
    sequelize, 
    modelName: 'SpOutcomeIndicator', 
    tableName: 'sp_outcome_indicators', 
    underscored: true 
  });

  return SpOutcomeIndicator;
};