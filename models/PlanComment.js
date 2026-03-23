'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class PlanComment extends Model {
    static associate(models) {
      // 1. Link back to the Strategic Plan (Now Optional)
      this.belongsTo(models.StrategicPlan, {
        foreignKey: 'plan_id',
        as: 'Plan'
      });

      // 3. Link to the User (NPA Admin or MDA Planner)
      this.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'Author'
      });
    }
  }

  PlanComment.init({
    // Changed allowNull to TRUE because a Report comment won't have a planId
    planId: {
      type: DataTypes.INTEGER,
      allowNull: true, 
      field: 'plan_id'
    },
    // NEW: Added reportId
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    statusAtTime: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'status_at_time'
    },
    isAdminComment: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_admin_comment'
    }
  }, {
    sequelize,
    modelName: 'PlanComment',
    tableName: 'plan_comments', 
    underscored: true,
    timestamps: true
  });

  return PlanComment;
};