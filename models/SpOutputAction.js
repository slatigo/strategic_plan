'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SpOutputAction extends Model {
    static associate(models) {
      /**
       * Link to the National Library (OutputAction).
       * If outputActionId is NULL, this is a custom action/activity
       * defined by the MUBS department.
       */
      if (models.OutputAction) {
        this.belongsTo(models.OutputAction, { 
          foreignKey: 'outputActionId', 
          as: 'LibraryAction' 
        });
      }
      
      if (models.SpOutput) {
        this.belongsTo(models.SpOutput, { 
          foreignKey: 'spOutputId', 
          as: 'SelectedOutput' 
        });
      }
      
      if (models.SpOutputActionBudget) {
        this.hasMany(models.SpOutputActionBudget, { 
          foreignKey: 'spOutputActionId', 
          as: 'Budgets' 
        });
      }

      if (models.Office) {
        this.belongsTo(models.Office, {
          foreignKey: 'responsibleOfficeId',
          as: 'ResponsibleOffice'
        });
      }

      if (models.BudgetSource) {
        this.belongsTo(models.BudgetSource, {
          foreignKey: 'budgetSourceId',
          as: 'BudgetSource'
        });
      }
    }

    // Helper to check for custom status
    isCustomAction() {
      return this.outputActionId === null;
    }
  }

  SpOutputAction.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    spOutputId: { 
      type: DataTypes.INTEGER, 
      field: 'sp_output_id',
      allowNull: false
    },
    // CHANGED: Allow NULL for custom activities
    outputActionId: { 
      type: DataTypes.INTEGER, 
      field: 'output_action_id',
      allowNull: true // Changed from false
    },
    // Ensure the description is provided for custom actions
    adaptedOutputAction: { 
      type: DataTypes.TEXT, // Changed to TEXT in case descriptions are long
      field: 'adapted_output_action',
      allowNull: false 
    },
    responsibleOfficeId: { 
      type: DataTypes.INTEGER, 
      field: 'responsible_office_id',
      allowNull: true
    },
    budgetSourceId: {
      type: DataTypes.INTEGER,
      field: 'budget_source_id',
      allowNull: true
    }
  }, { 
    sequelize, 
    modelName: 'SpOutputAction', 
    tableName: 'sp_output_actions', 
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return SpOutputAction;
};