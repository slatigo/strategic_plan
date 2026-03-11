'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SpOutputIndicator extends Model {
    static associate(models) {
      // 1. Link to the Library Indicator (NDP Standard)
      this.belongsTo(models.OutputIndicator, { 
        foreignKey: 'output_indicator_id', 
        as: 'LibraryIndicator' 
      });

      // 2. Link to the Parent Selected Output
      this.belongsTo(models.SpOutput, { 
        foreignKey: 'sp_output_id', 
        as: 'SelectedOutput' 
      });

      // 3. Link to the Children (The 5-year Targets)
      this.hasMany(models.SpOutputIndicatorTarget, { 
        foreignKey: 'sp_output_indicator_id', 
        as: 'Targets' 
      });
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
      type: DataTypes.STRING(255), 
      field: 'adapted_output_indicator',
      defaultValue: '0' 
    },
    officeId: { 
      type: DataTypes.INTEGER, 
      field: 'office_id' 
    },
    planId: { 
      type: DataTypes.INTEGER, 
      field: 'plan_id',
      allowNull: false 
    }
  }, { 
    sequelize, 
    modelName: 'SpOutputIndicator', 
    tableName: 'sp_output_indicators', 
    underscored: true 
  });

  return SpOutputIndicator;
};