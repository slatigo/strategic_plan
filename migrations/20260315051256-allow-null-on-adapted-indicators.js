'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Level 1: Outcomes
    await queryInterface.changeColumn('sp_outcome_indicators', 'adapted_outcome_indicator', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null
    });

    // Level 2: Intermediate
    await queryInterface.changeColumn('sp_intermediate_outcome_indicators', 'adapted_intermediate_outcome_indicator', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null
    });

    // Level 3: Outputs
    await queryInterface.changeColumn('sp_output_indicators', 'adapted_output_indicator', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to NOT NULL if needed (be careful, this fails if existing rows have nulls)
    await queryInterface.changeColumn('sp_intermediate_outcome_indicators', 'adapted_intermediate_outcome_indicator', {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: '0'
    });
    // ... repeat for others ...
  }
};