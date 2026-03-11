'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('output_actions', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      action_code: { type: Sequelize.STRING(30) },
      output_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'outputs', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      action: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('output_actions'); }
};