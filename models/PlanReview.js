'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class PlanReview extends Model {
    static associate(models) {
      this.belongsTo(models.StrategicPlan, { foreignKey: 'planId', as: 'Plan' });
      this.belongsTo(models.User, { foreignKey: 'userId', as: 'Author' });
    }
  }

  PlanReview.init({
    // Explicitly define FKs to match your other models
    planId: {
      type: DataTypes.INTEGER,
      field: 'plan_id'
    },
    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id'
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'PlanReview',
    tableName: 'plan_reviews',
    underscored: true,
    timestamps: false
  });

  return PlanReview;
};