'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('objectives', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      programme_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'programmes', key: 'id' },
        onDelete: 'CASCADE'
      },
      objective_code: { type: Sequelize.STRING, allowNull: false },
      objective_name: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('objectives'); }
};