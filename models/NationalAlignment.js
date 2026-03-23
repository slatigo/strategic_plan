'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NationalAlignment extends Model {
    static associate(models) {
      /**
       * 1. One baseline has many yearly target values.
       * We use 'indicator_code' as the foreignKey (the column in national_values)
       * and 'indicatorCode' as the sourceKey (the property in THIS model).
       */
      this.hasMany(models.NationalValue, {
        foreignKey: 'indicator_code',
        sourceKey: 'indicatorCode',
        as: 'YearlyValues'
      });

      // 2. Link to Output Indicators
      this.belongsTo(models.OutputIndicator, {
        foreignKey: 'indicatorCode',
        targetKey: 'indicatorCode',
        as: 'OutputInfo'
      });

      // 3. Link to Intermediate Outcome Indicators
      this.belongsTo(models.IntermediateOutcomeIndicator, {
        foreignKey: 'indicatorCode',
        targetKey: 'indicatorCode',
        as: 'IntermediateInfo'
      });

      // 4. Link to Outcome Indicators
      this.belongsTo(models.OutcomeIndicator, {
        foreignKey: 'indicatorCode',
        targetKey: 'indicatorCode',
        as: 'OutcomeInfo'
      });
    }
  }

  NationalAlignment.init({
    /**
     * We rename the JS property to indicatorCode (camelCase).
     * The 'field' property ensures it still talks to the 'indicator_code' 
     * column in your SQL database.
     */
    indicatorCode: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
      field: 'indicator_code', 
      comment: 'Unique code identifying the indicator',
      unique: true
    },
    baseline_value: {
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
    },
    polarity: {
      type: DataTypes.ENUM('Incr', 'Decr', 'Maintain'),
      allowNull: false,
      defaultValue: 'Incr'
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