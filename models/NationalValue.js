'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NationalValue extends Model {
    static associate(models) {
      // Link back to the Baseline/Alignment table
      this.belongsTo(models.NationalAlignment, {
        foreignKey: 'indicator_code',
        targetKey: 'indicator_code',
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
    // CHANGED: From STRING to DECIMAL to match the new DB structure
    value: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
      defaultValue: 0.00,
      get() {
        const val = this.getDataValue('value');
        return val === null ? null : parseFloat(val);
      }
    },
    // Adding remarks here too in case you have yearly-specific notes
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'NationalValue',
    tableName: 'nationalvalues', // Ensure lowercase to match your SQL style
    underscored: true,
    timestamps: false
  });

  return NationalValue;
};