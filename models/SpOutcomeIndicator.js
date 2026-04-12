'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SpOutcomeIndicator extends Model {
    static associate(models) {
      // Step 1: Link to the Library
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

      if (models.Office) {
        this.belongsTo(models.Office, {
          foreignKey: 'responsibleOfficeId',
          as: 'ResponsibleOffice'
        });
      }
    }

    isCustomIndicator() {
      return this.outcomeIndicatorId === null;
    }
  }

  SpOutcomeIndicator.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    outcomeIndicatorId: { 
      type: DataTypes.INTEGER, 
      field: 'outcome_indicator_id',
      allowNull: true 
    },
    spOutcomeId: { 
      type: DataTypes.INTEGER, 
      field: 'sp_outcome_id',
      allowNull: false
    },
    adaptedOutcomeIndicator: { 
      type: DataTypes.TEXT, 
      field: 'adapted_outcome_indicator',
      allowNull: false 
    },
    // The "Internal" Unit field for MUBS Custom Indicators
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
      field: 'responsible_office_id' 
    },
    dataSource: { 
      type: DataTypes.TEXT, 
      field: 'data_source' 
    }
  }, { 
    sequelize, 
    modelName: 'SpOutcomeIndicator', 
    tableName: 'sp_outcome_indicators', 
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    getterMethods: {
      /**
       * The Multi-Table Unit Resolver:
       * 1. Returns this.unitOfMeasure if planner added a custom one.
       * 2. Otherwise, goes Sp -> LibraryIndicator -> OutcomeNational -> unit_of_measure.
       */
      effectiveUnit() {
        if (this.unitOfMeasure) return this.unitOfMeasure;

        // Note: OutcomeNational matches the 'as' alias in your OutcomeIndicator model
        if (this.LibraryIndicator && this.LibraryIndicator.OutcomeNational) {
          return this.LibraryIndicator.OutcomeNational.unit_of_measure;
        }

        return null;
      }
    }
  });

  return SpOutcomeIndicator;
};