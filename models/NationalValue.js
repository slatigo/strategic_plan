'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NationalValue extends Model {
    static associate(models) {
      /**
       * CRITICAL FIX: 
       * targetKey MUST be 'indicatorCode' (camelCase) to match the 
       * property name we just defined in NationalAlignment.js.
       */
      this.belongsTo(models.NationalAlignment, {
        foreignKey: 'indicator_code',
        targetKey: 'indicatorCode',
        as: 'Alignment'
      });
    }
  }

  NationalValue.init({
    indicator_code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'indicator_code'
    },
    target_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'target_year'
    },
    value: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
      defaultValue: 0.00,
      get() {
        const val = this.getDataValue('value');
        return val === null ? null : parseFloat(val);
      }
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'NationalValue',
    tableName: 'nationalvalues', 
    underscored: true,
    timestamps: false
  });

  return NationalValue;
};