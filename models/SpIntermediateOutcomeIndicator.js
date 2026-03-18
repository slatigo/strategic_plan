'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SpIntermediateOutcomeIndicator extends Model {
    static associate(models) {
      if (models.IntermediateOutcomeIndicator) {
        this.belongsTo(models.IntermediateOutcomeIndicator, { 
          foreignKey: 'intermediateOutcomeIndicatorId', 
          as: 'LibraryIndicator' 
        });
      }

      if (models.SpIntermediateOutcome) {
        this.belongsTo(models.SpIntermediateOutcome, { 
          foreignKey: 'spIntermediateOutcomeId', 
          as: 'SelectedIntermediate' 
        });
      }

      if (models.SpIntermediateOutcomeIndicatorTarget) {
        this.hasMany(models.SpIntermediateOutcomeIndicatorTarget, { 
          foreignKey: 'spIntermediateOutcomeIndicatorId', 
          as: 'Targets' 
        });
      }

      // NEW: Responsible Office Link
      if (models.Office) {
        this.belongsTo(models.Office, {
          foreignKey: 'responsibleOfficeId',
          as: 'ResponsibleOffice'
        });
      }
    }
  }

  SpIntermediateOutcomeIndicator.init({
    intermediateOutcomeIndicatorId: { 
      type: DataTypes.INTEGER, 
      field: 'intermediate_outcome_indicator_id' 
    },
    spIntermediateOutcomeId: { 
      type: DataTypes.INTEGER, 
      field: 'sp_intermediate_outcome_id' 
    },
    adaptedIntermediateOutcomeIndicator: { 
      type: DataTypes.TEXT, 
      field: 'adapted_intermediate_outcome_indicator',
      allowNull: true,
      defaultValue: null
    },
    baselineValue: { 
      type: DataTypes.STRING, 
      field: 'baseline_value' 
    },
    responsibleOfficeId: { 
      type: DataTypes.INTEGER, 
      field: 'responsible_office_id',
      allowNull: true
    },
    dataSource: {
      type: DataTypes.TEXT,
      field: 'data_source',
      allowNull: true
    }
  }, { 
    sequelize, 
    modelName: 'SpIntermediateOutcomeIndicator', 
    tableName: 'sp_intermediate_outcome_indicators', 
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['plan_id', 'intermediate_outcome_indicator_id'],
        name: 'unique_indicator_per_plan'
      }
    ]
  });

  return SpIntermediateOutcomeIndicator;
};