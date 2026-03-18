'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NationalAlignment extends Model {
    static associate(models) {
      // One indicator code has many 5-year values
      NationalAlignment.hasMany(models.NationalValue, {
        foreignKey: 'indicator_code'
      });
    }
  }

  NationalAlignment.init({
    indicator_code: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    baseline_value: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'NationalAlignment',
    tableName: 'NationalAlignments',
    // This stops Sequelize from looking for createdAt/updatedAt
    timestamps: false 
  });

  return NationalAlignment;
};