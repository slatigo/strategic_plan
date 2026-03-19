'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = [
      { name: 'sp_outcome_indicator_reports', short: 'outc' },
      { name: 'sp_intermediate_outcome_indicator_reports', short: 'int_out' },
      { name: 'sp_output_indicator_reports', short: 'outp' },
      { name: 'sp_output_action_reports', short: 'act' }
    ];

    for (const table of tables) {
      const tableDef = await queryInterface.describeTable(table.name);

      // 1. Remove old column and its constraints if they exist
      if (tableDef.report_call_id) {
        try {
          // This removes the existing FK constraint by its generic MySQL name
          await queryInterface.removeConstraint(table.name, `${table.name}_ibfk_1`);
        } catch (e) { /* ignore */ }
        
        await queryInterface.removeColumn(table.name, 'report_call_id');
        console.log(`- Removed report_call_id from ${table.name}`);
      }

      // 2. Add mda_report_id as a plain column first
      if (!tableDef.mda_report_id) {
        await queryInterface.addColumn(table.name, 'mda_report_id', {
          type: Sequelize.INTEGER,
          allowNull: false
        });
        
        // 3. Add the Foreign Key Constraint manually with a SHORT name
        // This avoids the auto-generated "_foreign_idx" error
        await queryInterface.addConstraint(table.name, {
          fields: ['mda_report_id'],
          type: 'foreign key',
          name: `fk_${table.short}_rep`, // Very short name
          references: {
            table: 'mda_reports',
            field: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });

        console.log(`+ Added mda_report_id and constraint to ${table.name}`);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Reverse logic if necessary
  }
};