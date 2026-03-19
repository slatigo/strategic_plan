'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NationalAlignment extends Model {
    static associate(models) {
      // 1. One baseline has many yearly target values
      // We use 'indicator_code' (snake_case) because that is the JS property in NationalValue.js
      this.hasMany(models.NationalValue, {
        foreignKey: 'indicator_code',
        sourceKey: 'indicator_code',
        as: 'YearlyValues'
      });

      // 2. Link to Output Indicators
      // targetKey MUST be 'indicatorCode' because that is the name in OutputIndicator.js
      this.belongsTo(models.OutputIndicator, {
        foreignKey: 'indicator_code',
        targetKey: 'indicatorCode',
        as: 'OutputInfo'
      });

      // 3. Link to Intermediate Outcome Indicators
      this.belongsTo(models.IntermediateOutcomeIndicator, {
        foreignKey: 'indicator_code',
        targetKey: 'indicatorCode',
        as: 'IntermediateInfo'
      });

      // 4. Link to Outcome Indicators
      this.belongsTo(models.OutcomeIndicator, {
        foreignKey: 'indicator_code',
        targetKey: 'indicatorCode',
        as: 'OutcomeInfo'
      });
    }
  }

  NationalAlignment.init({
    // Note: We use indicator_code as the JS property name to match your primaryKey style
    indicator_code: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
      comment: 'Unique code identifying the indicator'
    },
    baseline_value: {
      // Correctly matches your new DECIMAL(20,2) SQL structure
      type: DataTypes.DECIMAL(20, 2),
      allowNull: true,
      defaultValue: null,
      get() {
        const value = this.getDataValue('baseline_value');
        return value === null ? null : parseFloat(value);
      }
    },
    unit_of_measure: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'unit_of_measure'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'NationalAlignment',
    tableName: 'nationalalignments',
    underscored: true,
    timestamps: false 
  });

  return NationalAlignment;
};