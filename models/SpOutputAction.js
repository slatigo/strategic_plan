'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SpOutputAction extends Model {
    static associate(models) {
      if (models.OutputAction) {
        this.belongsTo(models.OutputAction, { foreignKey: 'outputActionId', as: 'LibraryAction' });
      }
      if (models.SpOutput) {
        this.belongsTo(models.SpOutput, { foreignKey: 'spOutputId', as: 'SelectedOutput' });
      }
      if (models.SpOutputActionBudget) {
        this.hasMany(models.SpOutputActionBudget, { foreignKey: 'spOutputActionId', as: 'Budgets' });
      }

      // NEW: Link to Office lookup
      if (models.Office) {
        this.belongsTo(models.Office, {
          foreignKey: 'responsibleOfficeId',
          as: 'ResponsibleOffice'
        });
      }

      // NEW: Link to Budget Source lookup
      if (models.BudgetSource) {
        this.belongsTo(models.BudgetSource, {
          foreignKey: 'budgetSourceId',
          as: 'BudgetSource'
        });
      }
    }
  }

  SpOutputAction.init({
    spOutputId: { 
      type: DataTypes.INTEGER, 
      field: 'sp_output_id' 
    },
    outputActionId: { 
      type: DataTypes.INTEGER, 
      field: 'output_action_id' 
    },
    adaptedOutputAction: { 
      type: DataTypes.STRING, 
      field: 'adapted_output_action' 
    },
    // ID-based field for Office
    responsibleOfficeId: { 
      type: DataTypes.INTEGER, 
      field: 'responsible_office_id',
      allowNull: true
    },
    // ID-based field for Budget Source
    budgetSourceId: {
      type: DataTypes.INTEGER,
      field: 'budget_source_id',
      allowNull: true
    }
  }, { 
    sequelize, 
    modelName: 'SpOutputAction', 
    tableName: 'sp_output_actions', 
    underscored: true 
  });

  return SpOutputAction;
};