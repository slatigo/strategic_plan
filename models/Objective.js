'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Objective extends Model {
    static associate(models) {
      // Linked to a Programme
      this.belongsTo(models.Programme, { foreignKey: 'programmeId', as: 'Programme' });
      // Can be selected by many Strategic Plans
      this.hasMany(models.SpObjective, { foreignKey: 'objectiveId', as: 'Selections' });
    }
  }

  Objective.init({
    programmeId: { type: DataTypes.INTEGER, field: 'programme_id' },
    objectiveCode: { type: DataTypes.STRING, field: 'objective_code' },
    objectiveName: { type: DataTypes.TEXT, field: 'objective_name' }
  }, {
    sequelize,
    modelName: 'Objective',
    tableName: 'objectives',
    underscored: true
  });

  return Objective;
};