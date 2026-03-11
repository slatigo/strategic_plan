const { 
    StrategicPlan, PlanCall, Programme, Objective, SpObjective, 
    Outcome, OutcomeIndicator,SpOutcome, SpOutcomeIndicator, SpOutcomeIndicatorTarget,
    IntermediateOutcome, SpIntermediateOutcome, 
    Intervention, SpIntervention, 
    Output, OutputIndicator,SpOutput, SpOutputIndicator, SpOutputIndicatorTarget,
    OutputAction, SpOutputAction, SpOutputActionBudget,
    Sequelize,sequelize 
} = require('../../models');
const Op = Sequelize.Op;

exports.getPlanEditor = async (req, res) => {
    try {
        const { id } = req.params;

        const plan = await StrategicPlan.findByPk(id, {
            include: [
                { model: PlanCall, as: 'Call' },
                { model: Programme, as: 'Programme' },
                { 
                    model: SpObjective, 
                    as: 'SelectedObjectives',
                    include: [
                        { model: Objective, as: 'LibraryObjective' },
                        { 
                            model: SpOutcome, 
                            as: 'SelectedOutcomes',
                            include: [
                                { model: Outcome, as: 'LibraryOutcome' },
                                { 
                                    model: SpOutcomeIndicator, 
                                    as: 'SelectedIndicators', 
                                    include: [
                                        // ADDED: Include the library to get indicator text & unit_of_measure
                                        { model: OutcomeIndicator, as: 'LibraryIndicator' }, 
                                        { model: SpOutcomeIndicatorTarget, as: 'Targets' }
                                    ] 
                                },
                                {
                                    model: SpIntermediateOutcome,
                                    as: 'SelectedIntermediates',
                                    include: [
                                        { model: IntermediateOutcome, as: 'LibraryIntermediate' },
                                        {
                                            model: SpIntervention,
                                            as: 'SelectedInterventions',
                                            include: [
                                                { model: Intervention, as: 'LibraryIntervention' },
                                                {
                                                    model: SpOutput,
                                                    as: 'SelectedOutputs',
                                                    include: [
                                                        { model: Output, as: 'LibraryOutput' },
                                                        { 
                                                            model: SpOutputIndicator, 
                                                            as: 'SelectedIndicators', 
                                                            include: [
                                                                // ADDED: Include the library for Output Indicators
                                                                { model: OutputIndicator, as: 'LibraryIndicator' },
                                                                { model: SpOutputIndicatorTarget, as: 'Targets' }
                                                            ] 
                                                        },
                                                        { 
                                                            model: SpOutputAction, 
                                                            as: 'SelectedActions', 
                                                            include: [
                                                                { model: OutputAction, as: 'LibraryAction' },
                                                                { model: SpOutputActionBudget, as: 'Budgets' }
                                                            ] 
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ] 
                        }
                    ] 
                }
            ],
            order: [
                [{ model: SpObjective, as: 'SelectedObjectives' }, { model: Objective, as: 'LibraryObjective' }, 'objective_code', 'ASC']
            ]
        });
        

        if (!plan) return res.status(404).send("Plan not found");

        const selectedObjIds = plan.SelectedObjectives.map(obj => obj.objectiveId);
        const libraryObjectives = await Objective.findAll({
            where: { 
                programmeId: plan.programmeId,
                id: { [Op.notIn]: selectedObjIds.length > 0 ? selectedObjIds : [0] }
            },
            order: [['objective_code', 'ASC']]
        });

        const planCallFY = plan.Call.fy; // e.g., "2025/2026"
        const startYear = parseInt(planCallFY.split('/')[0]); // Extracts 2025
        const years = Array.from({ length: 5 }, (_, i) => startYear + i);
        res.render('mda/plan-editor', {
            title: 'Setup Strategic Plan: Full Framework',
            plan,
            libraryObjectives,
           
            years
        });

    } catch (error) {
        console.error("Editor Load Error:", error);
        res.status(500).send("Error loading editor: " + error.message);
    }
};

exports.addObjective = async (req, res) => {
    try {
        const { plan_id, objective_id, org_objective } = req.body;
        
        const selection = await SpObjective.create({
            planId: plan_id,
            objectiveId: objective_id,
            orgObjective: org_objective
        });

        res.status(201).json({ status: 'success', data: selection });
    } catch (error) {
        // Handle Duplicate Entry Error
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'This objective has already been added to your plan.' 
            });
        }

        console.error("Save Objective Error:", error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

exports.removeObjective = async (req, res) => {
    try {
        const { id } = req.params;
        await SpObjective.destroy({ where: { id } });
        res.json({ status: 'success', message: 'Objective removed' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};



exports.getLibraryOutcomes = async (req, res) => {
    try {
        const { objectiveId, spObjectiveId } = req.query;

        // 1. Get IDs of outcomes already selected for this specific SP Objective
        const alreadySelected = await SpOutcome.findAll({
            where: { spObjectiveId },
            attributes: ['outcomeId']
        });
        const selectedIds = alreadySelected.map(s => s.outcomeId);

        // 2. Fetch the library outcomes not in that list
        const outcomes = await Outcome.findAll({
            where: { 
                objectiveId,
                id: { [Op.notIn]: selectedIds.length > 0 ? selectedIds : [0] }
            },
            order: [['outcomeCode', 'ASC']]
        });

        res.json(outcomes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.addOutcome = async (req, res) => {
    try {
        const { sp_objective_id, outcome_id } = req.body;

        // Perform the create
        const selection = await SpOutcome.create({
            spObjectiveId: sp_objective_id,
            outcomeId: outcome_id
        });

        res.status(201).json({ 
            status: 'success', 
            message: 'Outcome successfully linked to objective',
            data: selection 
        });

    } catch (error) {
        // 1. Handle Duplicate Constraint (SequelizeUniqueConstraintError)
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'This outcome has already been added to this objective.' 
            });
        }

        // 2. Handle Foreign Key errors or other validation issues
        console.error("Save Outcome Error:", error);
        res.status(500).json({ 
            status: 'error', 
            message: 'An internal error occurred while saving the outcome.' 
        });
    }
};

// Save Indicator and its Annual Targets
exports.saveOutcomeIndicator = async (req, res) => {
  const t = await sequelize.transaction(); // Start transaction

  try {
    const { spOutcomeId, outcomeIndicatorId, baselineValue, targets } = req.body;
    const planId = req.params.planId || req.body.planId; 

    // 1. Create or Update the SpOutcomeIndicator
    const [indicator, created] = await SpOutcomeIndicator.findOrCreate({
        where: { spOutcomeId, outcomeIndicatorId,plan_id: planId },
        defaults: { 
            baselineValue, 
            planId: planId // Explicitly set it for the INSERT
        },
      transaction: t
    });

    if (!created) {
      await indicator.update({ baselineValue }, { transaction: t });
    }

    // 2. Handle the Annual Targets (2025-2029)
    if (targets && Object.keys(targets).length > 0) {
      // Clear existing targets for this specific indicator to avoid duplicates on update
      await SpOutcomeIndicatorTarget.destroy({
        where: { spOutcomeIndicatorId: indicator.id },
        transaction: t
      });

      // Prepare target array for bulk creation
      const targetRecords = Object.entries(targets).map(([year, value]) => ({
        spOutcomeIndicatorId: indicator.id,
        fy: year,
        val: value,
        planId: planId
      }));

      await SpOutcomeIndicatorTarget.bulkCreate(targetRecords, { transaction: t });
    }

    await t.commit(); // Commit the changes
    res.json({ status: 'success', message: 'Indicator and targets saved successfully' });

  } catch (error) {
    await t.rollback(); // Cancel everything if one part fails
    console.error("Error saving indicator:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getLibraryIndicatorsBySpOutcome = async (req, res) => {
  try {
    const { spOutcomeId } = req.params;
    const selection = await SpOutcome.findByPk(spOutcomeId);
    
    // Find indicators that belong to the Library Outcome
    const indicators = await OutcomeIndicator.findAll({
      where: { outcomeId: selection.outcomeId }
    });
    res.json(indicators);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};