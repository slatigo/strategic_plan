'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SpOutputAction extends Model {
    static associate(models) {
      this.belongsTo(models.OutputAction, { foreignKey: 'outputActionId', as: 'LibraryAction' });
      this.belongsTo(models.SpOutput, { foreignKey: 'spOutputId', as: 'SelectedOutput' });
      this.hasMany(models.SpOutputActionBudget, { foreignKey: 'spOutputActionId', as: 'Budgets' });
    }
  }
  SpOutputAction.init({
    spOutputId: { type: DataTypes.INTEGER, field: 'sp_output_id' },
    outputActionId: { type: DataTypes.INTEGER, field: 'output_action_id' },
    adaptedOutputAction: { type: DataTypes.STRING, field: 'adapted_output_action' },
    responsibleOffice: { type: DataTypes.STRING, field: 'responsible_office' },
    planId: { type: DataTypes.INTEGER, field: 'plan_id' }
  }, { sequelize, modelName: 'SpOutputAction', tableName: 'sp_output_actions', underscored: true });
  return SpOutputAction;
};