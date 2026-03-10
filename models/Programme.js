'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Programme extends Model {
    static associate(models) {
      this.hasMany(models.StrategicPlan, { foreignKey: 'programmeId', as: 'Plans' });
    }
  }

  Programme.init({
    programmeCode: { 
        type: DataTypes.STRING, 
        field: 'programme_code' 
    },
    programmeName: { 
        type: DataTypes.STRING, 
        field: 'programme_name' 
    },
    programmeGoal: { 
        type: DataTypes.TEXT, 
        field: 'programme_goal' 
    }
  }, {
    sequelize,
    modelName: 'Programme',
    tableName: 'programmes',
    underscored: true
  });

  return Programme;
};