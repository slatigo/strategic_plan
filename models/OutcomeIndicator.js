'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OutcomeIndicator extends Model {
    static associate(models) {
      if (models.Outcome) {
        this.belongsTo(models.Outcome, { 
          foreignKey: 'outcome_id', 
          as: 'ParentOutcome' 
        });
      }

      if (models.SpOutcomeIndicator) {
        this.hasMany(models.SpOutcomeIndicator, { 
          foreignKey: 'outcome_indicator_id', 
          as: 'Selections' 
        });
      }

      // NEW: Link to National Data (Baselines & Units)
      // This connects your high-level Outcomes to the decimal values
      if (models.NationalAlignment) {
        this.hasOne(models.NationalAlignment, {
          foreignKey: 'indicator_code',
          sourceKey: 'indicatorCode',
          as: 'NationalData'
        });
      }
    }
  }

  OutcomeIndicator.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    indicatorCode: {
      // UPDATED: Changed from 30 to 255 to match your SQL schema
      type: DataTypes.STRING(255), 
      field: 'indicator_code',
      allowNull: true
    },
    outcomeId: {
      type: DataTypes.INTEGER,
      field: 'outcome_id',
      allowNull: false,
      references: {
        model: 'outcomes',
        key: 'id'
      }
    },
    indicator: {
      // Tip: Outcomes are often long sentences, TEXT might be safer than STRING(255)
      type: DataTypes.TEXT, 
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'OutcomeIndicator',
    tableName: 'outcome_indicators',
    underscored: true,
  });

  return OutcomeIndicator;
};