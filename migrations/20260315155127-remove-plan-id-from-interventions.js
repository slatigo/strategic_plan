'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Removing plan_id from sp_interventions to fix ER_NO_DEFAULT_FOR_FIELD
     */
    await queryInterface.removeColumn('sp_interventions', 'plan_id');
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add it back in case of rollback
     */
    await queryInterface.addColumn('sp_interventions', 'plan_id', {
      type: Sequelize.INTEGER,
      allowNull: true // Set to true to avoid the same error on rollback
    });
  }
};