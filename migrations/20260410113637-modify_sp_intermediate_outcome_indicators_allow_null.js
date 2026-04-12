'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Drop the Foreign Keys first
      // Note: We drop ibfk_1 AND ibfk_3 because your schema shows both pointing to the same column
      await queryInterface.removeConstraint('sp_intermediate_outcome_indicators', 'sp_intermediate_outcome_indicators_ibfk_1', { transaction });
      await queryInterface.removeConstraint('sp_intermediate_outcome_indicators', 'sp_intermediate_outcome_indicators_ibfk_3', { transaction });

      // 2. Drop the Unique Index
      await queryInterface.removeIndex('sp_intermediate_outcome_indicators', 'unique_sp_int_outcome_indicator', { transaction });

      // 3. Modify the column to allow NULL
      await queryInterface.changeColumn('sp_intermediate_outcome_indicators', 'intermediate_outcome_indicator_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'intermediate_outcome_indicator_id'
      }, { transaction });

      // 4. Re-add the Foreign Key as a standard (non-unique) constraint
      await queryInterface.addConstraint('sp_intermediate_outcome_indicators', {
        fields: ['intermediate_outcome_indicator_id'],
        type: 'foreign key',
        name: 'fk_sp_int_indicator_library',
        references: {
          table: 'intermediate_outcome_indicators',
          field: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        transaction
      });

      // 5. Add a performance index (non-unique)
      await queryInterface.addIndex('sp_intermediate_outcome_indicators', ['sp_intermediate_outcome_id', 'intermediate_outcome_indicator_id'], {
        name: 'idx_sp_int_indicator_lookup',
        transaction
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Standard rollback logic if you ever need to revert to strict mode
  }
};