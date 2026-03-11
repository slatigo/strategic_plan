'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => { // Added DataTypes here
  class OutputAction extends Model {
    static associate(models) {
      this.belongsTo(models.Output, { foreignKey: 'output_id', as: 'LibraryOutput' });
      // Ensure SpOutputAction is also correctly exported in its own file!
      this.hasMany(models.SpOutputAction, { foreignKey: 'output_action_id', as: 'SelectedActions' });
    }
  }
  OutputAction.init({
    actionCode: { type: DataTypes.STRING, field: 'action_code' },
    outputId: { type: DataTypes.INTEGER, field: 'output_id' },
    action: { type: DataTypes.TEXT, allowNull: false }
  }, { sequelize, modelName: 'OutputAction', tableName: 'output_actions', underscored: true });
  return OutputAction;
};