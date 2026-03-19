'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class IntermediateOutcomeIndicator extends Model {
        static associate(models) {
            // 1. Link back to the Library Intermediate Outcome
            this.belongsTo(models.IntermediateOutcome, { 
                foreignKey: 'intermediateOutcomeId', 
                as: 'LibraryIntermediate' 
            });

            // 2. Link to the MDA selections
            this.hasMany(models.SpIntermediateOutcomeIndicator, { 
                foreignKey: 'intermediateOutcomeIndicatorId', 
                as: 'MdaSelections' 
            });

            // 3. NEW: Link to National Data (Baselines & Units)
            // This is how you get the decimals and units for this specific code
            this.hasOne(models.NationalAlignment, {
                foreignKey: 'indicator_code',
                sourceKey: 'indicatorCode',
                as: 'NationalData'
            });
        }
    }

    IntermediateOutcomeIndicator.init({
        indicatorCode: { 
            type: DataTypes.STRING(255), // Match SQL VARCHAR(255)
            field: 'indicator_code' 
        },
        intermediateOutcomeId: { 
            type: DataTypes.INTEGER, 
            field: 'intermediate_outcome_id' 
        },
        indicator: { 
            type: DataTypes.TEXT, 
            field: 'indicator' 
        }
    }, { 
        sequelize, 
        modelName: 'IntermediateOutcomeIndicator', 
        tableName: 'intermediate_outcome_indicators', 
        underscored: true,
        timestamps: true 
    });

    return IntermediateOutcomeIndicator;
};