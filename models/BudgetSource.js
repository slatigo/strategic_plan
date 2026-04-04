module.exports = (sequelize, DataTypes) => {
  const BudgetSource = sequelize.define('BudgetSource', {
    mdaId: {
      type: DataTypes.INTEGER,
      field: 'mda_id',
      allowNull: false
    },
    name: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    code: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'createdAt' // Forces Sequelize to use exactly this name
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updatedAt' // Forces Sequelize to use exactly this name
    }
  }, { 
    tableName: 'budgetsources',
    underscored: true,
    timestamps: true, // Set to true if your DB has createdAt/updatedAt
    
  });

  BudgetSource.associate = (models) => {
    // FIX: Match the casing of your Mda model (Sentence case)
    if (models.Mda) {
      BudgetSource.belongsTo(models.Mda, { 
        foreignKey: 'mda_id', 
        as: 'MDA' 
      });
    }

    if (models.SpOutputAction) {
      BudgetSource.hasMany(models.SpOutputAction, { 
        foreignKey: 'budget_source_id', 
        as: 'FundedActions' 
      });
    }
  };

  return BudgetSource;
};