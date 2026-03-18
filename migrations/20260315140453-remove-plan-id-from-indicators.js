module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('sp_outcome_indicators', 'plan_id');
    await queryInterface.removeColumn('sp_intermediate_outcome_indicators', 'plan_id');
    await queryInterface.removeColumn('sp_output_indicators', 'plan_id');
  },
  down: async (queryInterface, Sequelize) => {
    // Logic to add it back if you ever rollback
    await queryInterface.addColumn('sp_outcome_indicators', 'plan_id', { type: Sequelize.INTEGER });
  }
};