'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SpOutputActionBudget extends Model {
    static associate(models) {
      // Link back to the parent Action
      this.belongsTo(models.SpOutputAction, { 
        foreignKey: 'spOutputActionId', 
        as: 'Action' 
      });
    }
  }

  SpOutputActionBudget.init({
    fy: { 
      type: DataTypes.STRING(20), 
      allowNull: false 
    },
    spOutputActionId: { 
      type: DataTypes.INTEGER, 
      field: 'sp_output_action_id',
      allowNull: false
    },
    val: { 
      type: DataTypes.STRING, 
      allowNull: false 
    }
    // REMOVED: budgetSource and responsibleOffice are now in the parent table
  }, { 
    sequelize, 
    modelName: 'SpOutputActionBudget', 
    tableName: 'sp_output_action_budgets', 
    underscored: true 
  });

  return SpOutputActionBudget;
};