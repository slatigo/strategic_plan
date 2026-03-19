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

      // Link to the MDA selections
      this.hasMany(models.SpOutputIndicator, { 
        foreignKey: 'output_indicator_id', 
        as: 'Selections' 
      });

      // NEW: Link to the National Data (Using the indicator_code you just fixed)
      this.hasOne(models.NationalAlignment, {
        foreignKey: 'indicator_code',
        sourceKey: 'indicatorCode',
        as: 'NationalData'
      });
    }
  }

  OutputIndicator.init({
    indicatorCode: { 
      type: DataTypes.STRING(255), // Changed from 30 to 255 to match DB
      field: 'indicator_code',
      unique: true 
    },
    outputId: { 
      type: DataTypes.INTEGER, 
      field: 'output_id',
      allowNull: false 
    },
    indicator: { 
      type: DataTypes.TEXT, 
      allowNull: false 
    }
  }, {
    sequelize,
    modelName: 'OutputIndicator',
    tableName: 'output_indicators',
    underscored: true,
  });

  return OutputIndicator;
};