'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SpOutputIndicator extends Model {
    static associate(models) {
      // 1. REVERTED: Link to the Library Indicator using the Integer ID
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

      // Responsible Office Link
      if (models.Office) {
        this.belongsTo(models.Office, {
          foreignKey: 'responsibleOfficeId',
          as: 'ResponsibleOffice'
        });
      }
    }
  }

  SpOutputIndicator.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // REVERTED: Use the ID field that exists in your DB
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
      type: DataTypes.TEXT, 
      field: 'adapted_output_indicator',
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
    // REMOVED: indicatorCode (to prevent SQL 'Unknown column' crash)
  }, { 
    sequelize, 
    modelName: 'SpOutputIndicator', 
    tableName: 'sp_output_indicators', 
    underscored: true,
    timestamps: false
  });

  return SpOutputIndicator;
};