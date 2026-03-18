'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => { // Use the passed DataTypes
  class SpIntermediateOutcomeIndicatorTarget extends Model {
    static associate(models) {
      // Use camelCase to match the property defined in .init()
      this.belongsTo(models.SpIntermediateOutcomeIndicator, { 
        foreignKey: 'spIntermediateOutcomeIndicatorId', 
        as: 'Indicator' 
      });
    }
  }

  SpIntermediateOutcomeIndicatorTarget.init({
    fy: { 
      type: DataTypes.STRING(20), 
      allowNull: false 
    },
    spIntermediateOutcomeIndicatorId: { 
      type: DataTypes.INTEGER, 
      field: 'sp_intermediate_outcome_indicator_id' 
    },
    val: { 
      type: DataTypes.STRING(40) 
    },
  }, { 
    sequelize, 
    modelName: 'SpIntermediateOutcomeIndicatorTarget', 
    tableName: 'sp_intermediate_outcome_indicator_targets', 
    underscored: true,
    timestamps: false // Usually targets don't need created_at unless specified
  });

  return SpIntermediateOutcomeIndicatorTarget;
};