'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Output extends Model {
    static associate(models) {
      // Points back to the National Library Intervention
      this.belongsTo(models.Intervention, { 
        foreignKey: 'interventionId', 
        as: 'LibraryIntervention' 
      });

      // Links to standard indicators and actions
      this.hasMany(models.OutputIndicator, { 
        foreignKey: 'outputId', 
        as: 'LibraryIndicators' 
      });
      this.hasMany(models.OutputAction, { 
        foreignKey: 'outputId', 
        as: 'LibraryActions' 
      });
    }
  }

  Output.init({
    interventionId: { 
      type: DataTypes.INTEGER, 
      field: 'intervention_id',
      allowNull: false 
    },
    // Inside Output.init
  outputCode: { type: DataTypes.STRING, field: 'output_code' },
  output: { type: DataTypes.TEXT, field: 'output' } // Use 'output' as the JS name too
    }, { 
    sequelize, 
    modelName: 'Output', 
    tableName: 'outputs', 
    underscored: true,
    timestamps: true // Matches your created_at/updated_at columns
  });

  return Output;
};