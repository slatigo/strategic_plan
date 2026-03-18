'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Mda extends Model {
    static associate(models) {
      // One MDA can have many Users (MDA Admins)
      this.hasMany(models.User, {
        foreignKey: 'mda_id', // Changed from organization_id
        as: 'admins'
      });
      this.hasMany(models.Office, { 
        foreignKey: 'mda_id', // Recommended to use the actual DB column name
        as: 'Offices' 
      });
      this.hasMany(models.BudgetSource, { 
        foreignKey: 'mda_id', 
        as: 'BudgetSources' 
      });
      
      // Future-proofing: An MDA will own submissions
      // this.hasMany(models.Submission, { foreignKey: 'mda_id', as: 'submissions' });
    }
  }

  Mda.init({
    id: {
      type: DataTypes.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: 'Official MDA code (e.g., MOFPED, MOH, UNRA)'
    },
    type: {
      type: DataTypes.ENUM('Ministry', 'Department', 'Agency'),
      allowNull: false,
      defaultValue: 'Agency'
    }
  }, {
    sequelize,
    modelName: 'Mda',
    tableName: 'mdas', // Keep it clean and plural
    underscored: true,
    timestamps: true
  });

  return Mda;
};