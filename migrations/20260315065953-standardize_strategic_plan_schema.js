'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. HELPER: Shorten the most problematic table first using Raw SQL
    // This bypasses the automatic long index name generation
    const tableInfo = await queryInterface.describeTable('sp_intermediate_outcome_indicators');
    
    if (!tableInfo.responsible_office_id) {
      await queryInterface.sequelize.query(`
        ALTER TABLE sp_intermediate_outcome_indicators 
        ADD COLUMN responsible_office_id INT,
        ADD CONSTRAINT fk_sp_int_off FOREIGN KEY (responsible_office_id) REFERENCES Offices(id) ON DELETE SET NULL,
        ADD INDEX idx_sp_int_off (responsible_office_id);
      `);
    }

    // 2. CLEAN UP OTHER TABLES (These are usually short enough, but we'll still name them)
    const otherTables = ['sp_outcome_indicators', 'sp_output_indicators'];

    for (const table of otherTables) {
      const info = await queryInterface.describeTable(table);
      if (info.responsible_office) await queryInterface.removeColumn(table, 'responsible_office');
      
      if (!info.responsible_office_id) {
        await queryInterface.addColumn(table, 'responsible_office_id', {
          type: Sequelize.INTEGER,
          references: { model: 'Offices', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          name: `fk_${table.substring(0, 10)}_off` // Tiny name
        });
      }
      
      if (!info.data_source) {
        await queryInterface.addColumn(table, 'data_source', { type: Sequelize.TEXT });
      }
    }

    // 3. CLEAN UP ACTION TABLES
    const actionInfo = await queryInterface.describeTable('sp_output_actions');
    if (actionInfo.responsible_office) await queryInterface.removeColumn('sp_output_actions', 'responsible_office');

    if (!actionInfo.responsible_office_id) {
      await queryInterface.addColumn('sp_output_actions', 'responsible_office_id', {
        type: Sequelize.INTEGER,
        references: { model: 'Offices', key: 'id' },
        name: 'fk_sp_out_act_off'
      });
    }

    if (actionInfo.budget_source) {
      await queryInterface.renameColumn('sp_output_actions', 'budget_source', 'budget_source_id');
    }

    // 4. CLEAN UP BUDGETS (Remove redundant columns)
    const budgetInfo = await queryInterface.describeTable('sp_output_action_budgets');
    if (budgetInfo.responsible_office) await queryInterface.removeColumn('sp_output_action_budgets', 'responsible_office');
    if (budgetInfo.budget_source) await queryInterface.removeColumn('sp_output_action_budgets', 'budget_source');
  },

  down: async (queryInterface, Sequelize) => {
    // Reverting long names is rarely needed in dev, but you'd drop columns here.
  }
};