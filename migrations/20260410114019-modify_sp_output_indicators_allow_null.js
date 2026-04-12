'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Drop the Foreign Keys that use the column
      await queryInterface.removeConstraint('sp_output_indicators', 'sp_output_indicators_ibfk_1', { transaction });
      await queryInterface.removeConstraint('sp_output_indicators', 'sp_output_indicators_ibfk_3', { transaction });

      // 2. Drop the Unique Index
      await queryInterface.removeIndex('sp_output_indicators', 'unique_sp_output_indicator_adaptation', { transaction });

      // 3. Modify the column to allow NULL for Custom Indicators
      await queryInterface.changeColumn('sp_output_indicators', 'output_indicator_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'output_indicator_id'
      }, { transaction });

      // 4. Re-add the Foreign Key as a standard constraint
      await queryInterface.addConstraint('sp_output_indicators', {
        fields: ['output_indicator_id'],
        type: 'foreign key',
        name: 'fk_sp_output_indicator_library',
        references: {
          table: 'output_indicators',
          field: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        transaction
      });

      // 5. Add a lookup index for performance
      await queryInterface.addIndex('sp_output_indicators', ['sp_output_id', 'output_indicator_id'], {
        name: 'idx_sp_output_indicator_lookup',
        transaction
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Standard rollback logic if ever needed
  }
};