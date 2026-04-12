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

      if (models.Office) {
        this.belongsTo(models.Office, {
          foreignKey: 'responsibleOfficeId',
          as: 'ResponsibleOffice'
        });
      }
    }

    isCustomIndicator() {
      return this.intermediateOutcomeIndicatorId === null;
    }
  }

  SpIntermediateOutcomeIndicator.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    intermediateOutcomeIndicatorId: { 
      type: DataTypes.INTEGER, 
      field: 'intermediate_outcome_indicator_id',
      allowNull: true // Permissive for custom MUBS indicators
    },
    spIntermediateOutcomeId: { 
      type: DataTypes.INTEGER, 
      field: 'sp_intermediate_outcome_id',
      allowNull: false 
    },
    adaptedIntermediateOutcomeIndicator: { 
      type: DataTypes.TEXT, 
      field: 'adapted_intermediate_outcome_indicator',
      allowNull: false 
    },
    // NEW: The "Custom" Unit field
    unitOfMeasure: {
      type: DataTypes.STRING,
      field: 'unit_of_measure',
      allowNull: true
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
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    getterMethods: {
      /**
       * The Unit Resolver:
       * 1. Returns local unitOfMeasure if it's a Custom indicator.
       * 2. Otherwise, drills down into the NationalAlignment table via the Library.
       */
      effectiveUnit() {
        if (this.unitOfMeasure) return this.unitOfMeasure;

        // Ensure the alias 'IntermediateNational' matches what's in your Library model
        if (this.LibraryIndicator && this.LibraryIndicator.IntermediateNational) {
          return this.LibraryIndicator.IntermediateNational.unit_of_measure;
        }

        return null;
      }
    }
  });

  return SpIntermediateOutcomeIndicator;
};