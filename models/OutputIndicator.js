'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OutputIndicator extends Model {
    static associate(models) {
      // Link back to the Library Output
      this.belongsTo(models.Output, { 
        foreignKey: 'output_id', 
        as: 'ParentOutput' 
      });

      // Link to the MDA selections (SpOutputIndicator)
      // This allows you to see which MDAs picked this specific indicator
      this.hasMany(models.SpOutputIndicator, { 
        foreignKey: 'output_indicator_id', 
        as: 'Selections' 
      });
    }
  }

  OutputIndicator.init({
    indicatorCode: { 
      type: DataTypes.STRING(30), 
      field: 'indicator_code' 
    },
    outputId: { 
      type: DataTypes.INTEGER, 
      field: 'output_id',
      allowNull: false 
    },
    indicator: { 
      type: DataTypes.TEXT, 
      allowNull: false 
    },
    unitOfMeasure: { 
      type: DataTypes.STRING(50), 
      field: 'unit_of_measure' // Maps to the new DB column
    }
  }, {
    sequelize,
    modelName: 'OutputIndicator',
    tableName: 'output_indicators',
    underscored: true,
  });

  return OutputIndicator;
};