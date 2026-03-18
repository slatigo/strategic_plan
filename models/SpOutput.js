'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SpOutput extends Model {
    static associate(models) {
      // 1. Link to the Library definition
      this.belongsTo(models.Output, { 
        foreignKey: 'outputId', 
        as: 'LibraryOutput' 
      });

      // 2. Link to the Parent Intervention selection
      this.belongsTo(models.SpIntervention, { 
        foreignKey: 'spInterventionId', 
        as: 'SelectedIntervention' 
      });

      // 3. Link to Children (Indicators and Actions)
      this.hasMany(models.SpOutputIndicator, { 
        foreignKey: 'spOutputId', 
        as: 'SelectedIndicators' 
      });
      
      this.hasMany(models.SpOutputAction, { 
        foreignKey: 'spOutputId', 
        as: 'SelectedActions' 
      });
    }
  }

  SpOutput.init({
    spInterventionId: { 
      type: DataTypes.INTEGER, 
      field: 'sp_intervention_id',
      allowNull: false 
    },
    outputId: { 
      type: DataTypes.INTEGER, 
      field: 'output_id',
      allowNull: false 
    },
  }, { 
    sequelize, 
    modelName: 'SpOutput', 
    tableName: 'sp_outputs', 
    underscored: true 
  });

  return SpOutput;
};