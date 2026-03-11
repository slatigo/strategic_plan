'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sp_output_indicators', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      output_indicator_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'output_indicators', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      sp_output_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sp_outputs', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      adapted_output_indicator: { type: Sequelize.STRING(255), allowNull: false, defaultValue: '0' },
      office_id: { type: Sequelize.INTEGER }, // References your departments/units
      plan_id: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // Ensures we don't duplicate the same indicator link within the same output adaptation
    await queryInterface.addConstraint('sp_output_indicators', {
      fields: ['output_indicator_id', 'sp_output_id', 'adapted_output_indicator'],
      type: 'unique',
      name: 'unique_sp_output_indicator_adaptation'
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('sp_output_indicators'); }
};