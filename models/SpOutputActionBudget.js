'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SpOutputActionBudget extends Model {
    static associate(models) {
      this.belongsTo(models.SpOutputAction, { foreignKey: 'spOutputActionId', as: 'Action' });
    }
  }
  SpOutputActionBudget.init({
    fy: { type: DataTypes.STRING, allowNull: false },
    spOutputActionId: { type: DataTypes.INTEGER, field: 'sp_output_action_id' },
    val: { type: DataTypes.STRING, allowNull: false },
    planId: { type: DataTypes.INTEGER, field: 'plan_id' },
    budgetSource: { type: DataTypes.STRING, field: 'budget_source' }
  }, { sequelize, modelName: 'SpOutputActionBudget', tableName: 'sp_output_action_budgets', underscored: true });
  return SpOutputActionBudget;
};