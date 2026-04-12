'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    const tableName = 'sp_output_actions';

    try {
      // Helper function to safely remove constraints if they exist
      const safeRemove = async (constraintName) => {
        const constraints = await queryInterface.showConstraint(tableName);
        if (constraints.find(c => c.constraintName === constraintName)) {
          await queryInterface.removeConstraint(tableName, constraintName, { transaction });
        }
      };

      // 1. Drop ALL Foreign Keys (Safely)
      await safeRemove('sp_output_actions_ibfk_1');
      await safeRemove('sp_output_actions_ibfk_2');
      await safeRemove('sp_output_actions_ibfk_3');

      // 2. Drop the Unique Index
      // We wrap this in a try-catch because showConstraint doesn't always list indexes clearly
      try {
        await queryInterface.removeIndex(tableName, 'unique_sp_output_action', { transaction });
      } catch (e) {
        console.log("Index unique_sp_output_action might already be gone, skipping...");
      }

      // 3. Modify the column to allow NULL
      await queryInterface.changeColumn(tableName, 'output_action_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }, { transaction });

      // 4. Re-add the Foreign Key for the Parent (sp_output_id)
      await queryInterface.addConstraint(tableName, {
        fields: ['sp_output_id'],
        type: 'foreign key',
        name: 'sp_output_actions_ibfk_1',
        references: {
          table: 'sp_outputs',
          field: 'id'
        },
        onDelete: 'CASCADE',
        transaction
      });

      // 5. Re-add the Foreign Key for the Library (output_action_id)
      await queryInterface.addConstraint(tableName, {
        fields: ['output_action_id'],
        type: 'foreign key',
        name: 'fk_sp_output_action_library',
        references: {
          table: 'output_actions',
          field: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        transaction
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Standard rollback
  }
};