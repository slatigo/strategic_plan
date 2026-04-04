module.exports = (sequelize, DataTypes) => {
  const Office = sequelize.define('Office', {
    mdaId: { // ADD THIS
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
    }
  }, { 
    tableName: 'offices',
    underscored: false,
    timestamps: true,
    createdAt: 'createdAt', 
    updatedAt: 'updatedAt'
  });

  Office.associate = (models) => {
    Office.belongsTo(models.Mda, { foreignKey: 'mdaId', as: 'MDA' });
    // Check for existence to prevent "not a subclass" errors during initialization
    if (models.SpOutputAction) {
      Office.hasMany(models.SpOutputAction, { 
        foreignKey: 'responsible_office_id', 
        as: 'Actions' 
      });
    }

    if (models.SpOutcomeIndicator) {
      Office.hasMany(models.SpOutcomeIndicator, { 
        foreignKey: 'responsible_office_id', 
        as: 'OutcomeIndicators' 
      });
    }

    if (models.SpIntermediateOutcomeIndicator) {
      Office.hasMany(models.SpIntermediateOutcomeIndicator, { 
        foreignKey: 'responsible_office_id', 
        as: 'IntermediateIndicators' 
      });
    }

    if (models.SpOutputIndicator) {
      Office.hasMany(models.SpOutputIndicator, { 
        foreignKey: 'responsible_office_id', 
        as: 'OutputIndicators' 
      });
    }
  };

  return Office;
};