'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ReportComment extends Model {
    static associate(models) {
      this.belongsTo(models.MdaReport, { foreignKey: 'report_id', as: 'Report' });
      this.belongsTo(models.User, { foreignKey: 'user_id', as: 'Author' });
    }
  }

  ReportComment.init({
    reportId: { type: DataTypes.INTEGER, field: 'report_id' },
    userId: { type: DataTypes.INTEGER, field: 'user_id' },
    message: DataTypes.TEXT,
    statusAtTime: { type: DataTypes.STRING, field: 'status_at_time' },
    isAdminComment: { type: DataTypes.BOOLEAN, field: 'is_admin_comment' }
  }, {
    sequelize,
    modelName: 'ReportComment',
    tableName: 'report_comments',
    underscored: true,
    timestamps: true
  });

  return ReportComment;
};