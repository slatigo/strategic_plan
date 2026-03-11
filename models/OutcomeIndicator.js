'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OutcomeIndicator extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Link back to the Library Outcome (Parent)
      this.belongsTo(models.Outcome, { 
        foreignKey: 'outcome_id', 
        as: 'ParentOutcome' 
      });

      // Link to the MDA selections (Children)
      // This is what SpOutcomeIndicator.belongsTo(models.OutcomeIndicator) looks for!
      this.hasMany(models.SpOutcomeIndicator, { 
        foreignKey: 'outcome_indicator_id', 
        as: 'Selections' 
      });
      
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
      type: DataTypes.STRING(30),
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
      type: DataTypes.STRING(255),
      allowNull: false
    },
    unitOfMeasure: {
      type: DataTypes.STRING(50),
      field: 'unit_of_measure',
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'OutcomeIndicator', // EXACTLY matching what SpOutcomeIndicator expects
    tableName: 'outcome_indicators',
    underscored: true, // Handles created_at and updated_at automatically
  });

  return OutcomeIndicator;
};