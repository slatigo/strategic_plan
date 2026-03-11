'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sp_output_indicator_targets', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      fy: { type: Sequelize.STRING(11), allowNull: false },
      sp_output_indicator_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sp_output_indicators', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      val: { type: Sequelize.STRING(40), allowNull: false },
      plan_id: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addConstraint('sp_output_indicator_targets', {
      fields: ['fy', 'sp_output_indicator_id'],
      type: 'unique',
      name: 'unique_fy_output_indicator_target'
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('sp_output_indicator_targets'); }
};