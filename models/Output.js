'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => { // Added DataTypes here
  class Output extends Model {
    static associate(models) {
      this.belongsTo(models.Intervention, { foreignKey: 'intervention_id', as: 'LibraryIntervention' });
      this.hasMany(models.OutputAction, { foreignKey: 'output_id', as: 'LibraryActions' });
      this.hasMany(models.OutputIndicator, { foreignKey: 'output_id', as: 'LibraryIndicators' });
    }
  }
  Output.init({
    interventionId: { type: DataTypes.INTEGER, field: 'intervention_id' },
    outputCode: { type: DataTypes.STRING, field: 'output_code' },
    output: { type: DataTypes.TEXT, field: 'output' }
  }, { sequelize, modelName: 'Output', tableName: 'outputs', underscored: true });
  return Output;
};