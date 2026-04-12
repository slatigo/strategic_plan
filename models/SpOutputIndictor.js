'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SpOutputIndicator extends Model {
    static associate(models) {
      this.belongsTo(models.OutputIndicator, { 
        foreignKey: 'outputIndicatorId', 
        as: 'LibraryIndicator' 
      });

      this.belongsTo(models.SpOutput, { 
        foreignKey: 'spOutputId', 
        as: 'SelectedOutput' 
      });

      this.hasMany(models.SpOutputIndicatorTarget, { 
        foreignKey: 'spOutputIndicatorId', 
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
      return this.outputIndicatorId === null;
    }
  }

  SpOutputIndicator.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    outputIndicatorId: { 
      type: DataTypes.INTEGER, 
      field: 'output_indicator_id',
      allowNull: true 
    },
    spOutputId: { 
      type: DataTypes.INTEGER, 
      field: 'sp_output_id',
      allowNull: false 
    },
    adaptedOutputIndicator: { 
      type: DataTypes.TEXT, 
      field: 'adapted_output_indicator',
      allowNull: false 
    },
    // NEW: The "Custom" Unit field for MUBS-specific outputs
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
    modelName: 'SpOutputIndicator', 
    tableName: 'sp_output_indicators', 
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    getterMethods: {
      /**
       * The Unit Resolver:
       * 1. Check local unitOfMeasure (Custom).
       * 2. Otherwise, drill down into NationalAlignment via the Library.
       */
      effectiveUnit() {
        if (this.unitOfMeasure) return this.unitOfMeasure;

        // Ensure 'OutputNational' matches the association alias in OutputIndicator.js
        if (this.LibraryIndicator && this.LibraryIndicator.OutputNational) {
          return this.LibraryIndicator.OutputNational.unit_of_measure;
        }

        return null;
      }
    }
  });

  return SpOutputIndicator;
};