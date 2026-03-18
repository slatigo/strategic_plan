'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SpOutputIndicatorTarget extends Model {
    static associate(models) {
      this.belongsTo(models.SpOutputIndicator, { foreignKey: 'sp_output_indicator_id', as: 'Indicator' });
    }
  }
  SpOutputIndicatorTarget.init({
    fy: { type: DataTypes.STRING(11), allowNull: false },
    spOutputIndicatorId: { type: DataTypes.INTEGER, field: 'sp_output_indicator_id' },
    val: { type: DataTypes.STRING(40), allowNull: false },
  }, { sequelize, modelName: 'SpOutputIndicatorTarget', tableName: 'sp_output_indicator_targets', underscored: true });
  return SpOutputIndicatorTarget;
};