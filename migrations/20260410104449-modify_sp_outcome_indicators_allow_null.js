'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Drop the Foreign Keys first
      // Based on your SHOW CREATE TABLE, you have multiple pointing to the same column
      await queryInterface.removeConstraint('sp_outcome_indicators', 'sp_outcome_indicators_ibfk_1', { transaction });
      await queryInterface.removeConstraint('sp_outcome_indicators', 'sp_outcome_indicators_ibfk_3', { transaction });

      // 2. Now we can safely drop the Unique Index
      await queryInterface.removeIndex('sp_outcome_indicators', 'unique_sp_outcome_indicator', { transaction });

      // 3. Modify the column to allow NULL
      await queryInterface.changeColumn('sp_outcome_indicators', 'outcome_indicator_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'outcome_indicator_id'
      }, { transaction });

      // 4. Re-add the Foreign Key (Standard, non-unique)
      await queryInterface.addConstraint('sp_outcome_indicators', {
        fields: ['outcome_indicator_id'],
        type: 'foreign key',
        name: 'sp_outcome_indicators_outcome_indicator_id_fk',
        references: {
          table: 'outcome_indicators',
          field: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        transaction
      });

      // 5. Add a standard index for performance
      await queryInterface.addIndex('sp_outcome_indicators', ['sp_outcome_id', 'outcome_indicator_id'], {
        name: 'idx_sp_outcome_indicator_lookup',
        transaction
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Standard rollback logic here if needed, 
    // but usually, once we unlock custom indicators, we rarely go back.
  }
};