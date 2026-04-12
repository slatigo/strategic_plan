'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. SpOutcomeIndicator
    await queryInterface.changeColumn('sp_outcome_indicators', 'outcome_indicator_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'outcome_indicators', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // 2. SpIntermediateOutcomeIndicator
    await queryInterface.changeColumn('sp_intermediate_outcome_indicators', 'intermediate_outcome_indicator_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'intermediate_outcome_indicators', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // 3. SpOutputIndicator
    await queryInterface.changeColumn('sp_output_indicators', 'output_indicator_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'output_indicators', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // 4. SpOutputAction
    await queryInterface.changeColumn('sp_output_actions', 'output_action_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'output_actions', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // REVERT logic: This would make them NOT NULL again
    // Note: This will fail if you already have NULL data in the DB!
    await queryInterface.changeColumn('sp_outcome_indicators', 'outcome_indicator_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
    // ... repeat for others if needed
  }
};