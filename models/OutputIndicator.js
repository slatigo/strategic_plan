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

      // UPDATED: Link to the National Data using the Unique Alias
      // This matches the 'OutputNational' used in the Controller
      this.hasOne(models.NationalAlignment, {
        foreignKey: 'indicator_code',
        sourceKey: 'indicatorCode',
        as: 'OutputNational' // <--- CHANGED THIS from 'NationalData'
      });
    }
  }

  OutputIndicator.init({
    indicatorCode: { 
      type: DataTypes.STRING(255), 
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