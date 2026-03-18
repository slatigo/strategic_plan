'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SpOutputIndicator extends Model {
    static associate(models) {
      // 1. Link to the Library Indicator
      this.belongsTo(models.OutputIndicator, { 
        foreignKey: 'outputIndicatorId', 
        as: 'LibraryIndicator' 
      });

      // 2. Link to the Parent Selected Output
      this.belongsTo(models.SpOutput, { 
        foreignKey: 'spOutputId', 
        as: 'SelectedOutput' 
      });

      // 3. Targets
      this.hasMany(models.SpOutputIndicatorTarget, { 
        foreignKey: 'spOutputIndicatorId', 
        as: 'Targets' 
      });

      // NEW: Responsible Office Link (Matching the others)
      if (models.Office) {
        this.belongsTo(models.Office, {
          foreignKey: 'responsibleOfficeId',
          as: 'ResponsibleOffice'
        });
      }
    }
  }

  SpOutputIndicator.init({
    outputIndicatorId: { 
      type: DataTypes.INTEGER, 
      field: 'output_indicator_id',
      allowNull: false 
    },
    spOutputId: { 
      type: DataTypes.INTEGER, 
      field: 'sp_output_id',
      allowNull: false 
    },
    adaptedOutputIndicator: { 
      type: DataTypes.TEXT, // Changed to TEXT for longer descriptions
      field: 'adapted_output_indicator',
      allowNull: true, 
      defaultValue: null 
    },
    baselineValue: { 
      type: DataTypes.STRING, 
      field: 'baseline_value' 
    },
    // RENAME: from officeId to responsibleOfficeId for consistency
    responsibleOfficeId: { 
      type: DataTypes.INTEGER, 
      field: 'responsible_office_id',
      allowNull: true
    },
    // NEW: Added for consistency with Intermediate model
    dataSource: {
      type: DataTypes.TEXT,
      field: 'data_source',
      allowNull: true
    }
  }, { 
    sequelize, 
    modelName: 'SpOutputIndicator', 
    tableName: 'sp_output_indicators', 
    underscored: true 
  });

  return SpOutputIndicator;
};