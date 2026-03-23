'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SpIntermediateOutcomeIndicator extends Model {
    static associate(models) {
      /**
       * REVERTED: Join back using the Integer ID.
       * This matches your current DB structure. The National data 
       * will be fetched through this LibraryIndicator in the controller.
       */
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

      if (models.Office) {
        this.belongsTo(models.Office, {
          foreignKey: 'responsibleOfficeId',
          as: 'ResponsibleOffice'
        });
      }
    }
  }

  SpIntermediateOutcomeIndicator.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // REVERTED: Using the ID field that actually exists in your DB
    intermediateOutcomeIndicatorId: { 
      type: DataTypes.INTEGER, 
      field: 'intermediate_outcome_indicator_id',
      allowNull: false
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
    // REMOVED: indicatorCode (as it is not a column in this table)
  }, { 
    sequelize, 
    modelName: 'SpIntermediateOutcomeIndicator', 
    tableName: 'sp_intermediate_outcome_indicators', 
    underscored: true,
    timestamps: false
  });

  return SpIntermediateOutcomeIndicator;
};