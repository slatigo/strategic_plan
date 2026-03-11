'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SpIntermediateOutcome extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 1. Link to the Parent Selection (Selected Outcome)
      this.belongsTo(models.SpOutcome, { 
        foreignKey: 'sp_outcome_id', 
        as: 'SelectedOutcome' 
      });

      // 2. Link to the Library definition (NDP Standard)
      this.belongsTo(models.IntermediateOutcome, { 
        foreignKey: 'intermediate_outcome_id', 
        as: 'LibraryIntermediate' 
      });

      // 3. Link to Children (Selected Interventions)
      this.hasMany(models.SpIntervention, { 
        foreignKey: 'sp_intermediate_outcome_id', 
        as: 'SelectedInterventions' 
      });
      
      // 4. Link to Selected Indicators
      this.hasMany(models.SpIntermediateOutcomeIndicator, { 
        foreignKey: 'sp_intermediate_outcome_id', 
        as: 'SelectedIndicators' 
      });
    }
  }

  SpIntermediateOutcome.init({
    spOutcomeId: { 
      type: DataTypes.INTEGER, 
      field: 'sp_outcome_id',
      allowNull: false 
    },
    intermediateOutcomeId: { 
      type: DataTypes.INTEGER, 
      field: 'intermediate_outcome_id',
      allowNull: false 
    },
    planId: { 
      type: DataTypes.INTEGER, 
      field: 'plan_id',
      allowNull: false 
    }
  }, {
    sequelize,
    modelName: 'SpIntermediateOutcome',
    tableName: 'sp_intermediate_outcomes',
    underscored: true,
  });

  return SpIntermediateOutcome;
};