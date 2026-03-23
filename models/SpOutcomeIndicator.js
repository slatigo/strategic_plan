'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SpOutcomeIndicator extends Model {
    static associate(models) {
      /**
       * REVERTED: We use outcomeIndicatorId (Integer) to link to the Library.
       * The "National Data" will be accessed via the LibraryIndicator 
       * because the Library table is the one that actually holds the code.
       */
      this.belongsTo(models.OutcomeIndicator, { 
        foreignKey: 'outcomeIndicatorId', 
        as: 'LibraryIndicator' 
      });

      this.belongsTo(models.SpOutcome, { 
        foreignKey: 'spOutcomeId', 
        as: 'SelectedOutcome' 
      });

      this.hasMany(models.SpOutcomeIndicatorTarget, { 
        foreignKey: 'spOutcomeIndicatorId', 
        as: 'Targets' 
      });

      if (models.Office) {
        this.belongsTo(models.Office, {
          foreignKey: 'responsibleOfficeId',
          as: 'ResponsibleOffice'
        });
      }
    }
  }

  SpOutcomeIndicator.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // REVERTED: Link via the existing Integer ID
    outcomeIndicatorId: { 
      type: DataTypes.INTEGER, 
      field: 'outcome_indicator_id',
      allowNull: false
    },
    spOutcomeId: { 
      type: DataTypes.INTEGER, 
      field: 'sp_outcome_id' 
    },
    adaptedOutcomeIndicator: { 
      type: DataTypes.TEXT, 
      field: 'adapted_outcome_indicator' 
    },
    baselineValue: { 
      type: DataTypes.STRING, 
      field: 'baseline_value' 
    },
    responsibleOfficeId: { 
      type: DataTypes.INTEGER, 
      field: 'responsible_office_id' 
    },
    dataSource: { 
      type: DataTypes.TEXT, 
      field: 'data_source' 
    }
    // REMOVED: indicatorCode (since it doesn't exist in your DB table)
  }, { 
    sequelize, 
    modelName: 'SpOutcomeIndicator', 
    tableName: 'sp_outcome_indicators', 
    underscored: true,
    timestamps: false
  });

  return SpOutcomeIndicator;
};