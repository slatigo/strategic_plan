'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      // Logic: A user belongs to one MDA (e.g., Ministry of Health)
      this.belongsTo(models.Mda, {
        foreignKey: 'mda_id',
        as: 'mda'
      });
    }

    validPassword(password) {
      return bcrypt.compareSync(password, this.password);
    }
  }

  User.init({
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      // UPDATED: Refined the role names to align with MDAs
      type: DataTypes.ENUM('npa_admin', 'mda_admin'),
      allowNull: false,
      defaultValue: 'mda_admin'
    },
    active: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    },
    mda_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'mdas', // Points to the new table name
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  return User;
};