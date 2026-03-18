'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class IntermediateOutcomeIndicator extends Model {
        static associate(models) {
            // Link back to the Library Intermediate Outcome
            this.belongsTo(models.IntermediateOutcome, { 
                foreignKey: 'intermediateOutcomeId', 
                as: 'LibraryIntermediate' 
            });

            // Link to the MDA selections
            this.hasMany(models.SpIntermediateOutcomeIndicator, { 
                foreignKey: 'intermediateOutcomeIndicatorId', 
                as: 'MdaSelections' 
            });
        }
    }

    IntermediateOutcomeIndicator.init({
        // Matches DB: indicator_code
        indicatorCode: { 
            type: DataTypes.STRING, 
            field: 'indicator_code' 
        },
        // Matches DB: intermediate_outcome_id
        intermediateOutcomeId: { 
            type: DataTypes.INTEGER, 
            field: 'intermediate_outcome_id' 
        },
        // Matches DB: indicator (THIS FIXED THE RECENT ERROR)
        indicator: { 
            type: DataTypes.TEXT, 
            field: 'indicator' 
        },
        // Added this since it's in your SQL schema
        unitOfMeasure: {
            type: DataTypes.STRING,
            field: 'unit_of_measure'
        }
    }, { 
        sequelize, 
        modelName: 'IntermediateOutcomeIndicator', 
        tableName: 'intermediate_outcome_indicators', 
        underscored: true,
        // SQL schema has created_at and updated_at, so we keep timestamps: true
        timestamps: true 
    });

    return IntermediateOutcomeIndicator;
};