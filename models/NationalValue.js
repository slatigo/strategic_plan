'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NationalValue extends Model {
    static associate(models) {
      // Link back to the Bridge
      NationalValue.belongsTo(models.NationalAlignment, {
        foreignKey: 'indicator_code'
      });
    }
  }

  NationalValue.init({
    indicator_code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    target_year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // This is the single column for both Targets and Budgets
    value: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'NationalValue',
    tableName: 'NationalValues',
    // Keeping it clean - no timestamps
    timestamps: false 
  });

  return NationalValue;
};