'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('NationalAlignments', 'polarity', {
      type: Sequelize.ENUM('Incr', 'Decr', 'Maintain'),
      allowNull: false,
      defaultValue: 'Incr',
      comment: 'Incr: Higher is better (e.g. GDP), Decr: Lower is better (e.g. Poverty), Maintain: Target must be met exactly'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('NationalAlignments', 'polarity');
    // Note: To fully undo an ENUM in some SQL dialects, you might need to drop the type, 
    // but for most dev environments, removeColumn is sufficient.
  }
};