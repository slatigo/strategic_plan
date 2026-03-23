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

      // UPDATED: Link to National Data using the Unique Alias
      if (models.NationalAlignment) {
        this.hasOne(models.NationalAlignment, {
          foreignKey: 'indicator_code',
          sourceKey: 'indicatorCode',
          as: 'OutcomeNational' // <--- CHANGED THIS from 'NationalData'
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