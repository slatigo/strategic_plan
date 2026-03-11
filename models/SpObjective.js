'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SpObjective extends Model {
    static associate(models) {
      // Belongs to a specific Strategic Plan
      this.belongsTo(models.StrategicPlan, { foreignKey: 'planId', as: 'Plan' });
      // References a specific Master Objective
      this.belongsTo(models.Objective, { foreignKey: 'objectiveId', as: 'LibraryObjective' });
      this.hasMany(models.SpOutcome, { 
        foreignKey: 'spObjectiveId', 
        as: 'SelectedOutcomes' 
      });
    }
  }

  SpObjective.init({
    planId: { type: DataTypes.INTEGER, field: 'plan_id' },
    objectiveId: { type: DataTypes.INTEGER, field: 'objective_id' },
    orgObjective: { type: DataTypes.TEXT, field: 'org_objective' }
  }, {
    sequelize,
    modelName: 'SpObjective',
    tableName: 'sp_objectives',
    underscored: true
  });

  return SpObjective;
};