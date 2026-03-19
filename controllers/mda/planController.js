const { 
    StrategicPlan, PlanCall, Programme, SpObjective, Objective, 
    SpOutcome, Outcome, SpOutcomeIndicator, OutcomeIndicator, 
    SpOutcomeIndicatorTarget, SpIntermediateOutcome, IntermediateOutcome, 
    SpIntermediateOutcomeIndicator, IntermediateOutcomeIndicator, 
    SpIntermediateOutcomeIndicatorTarget, SpIntervention, Intervention, 
    SpOutput, Output, SpOutputIndicator, OutputIndicator, 
    SpOutputIndicatorTarget, SpOutputAction, OutputAction, 
    SpOutputActionBudget, Office, BudgetSource,sequelize
} = require('../../models');

const { Op } = require('sequelize');

exports.getPlanEditor = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch lookup tables for the dropdowns
        const offices = await Office.findAll({ 
                where: { mdaId: req.user.mdaId },
                order: [['name', 'ASC']] 
        });
        const budgetSources = await BudgetSource.findAll({ 
            where: { mdaId: req.user.mdaId },
            order: [['name', 'ASC']] 
        });
        const check = {
            PlanCall, Programme, SpObjective, Objective, SpOutcome, Outcome, 
            SpOutcomeIndicator, OutcomeIndicator, SpOutcomeIndicatorTarget,
            SpIntermediateOutcome, IntermediateOutcome, SpIntermediateOutcomeIndicator, 
            IntermediateOutcomeIndicator, SpIntermediateOutcomeIndicatorTarget,
            SpIntervention, Intervention, SpOutput, Output, SpOutputIndicator, 
            OutputIndicator, SpOutputIndicatorTarget, SpOutputAction, OutputAction, 
            SpOutputActionBudget, Office, BudgetSource
        };

        Object.entries(check).forEach(([name, model]) => {
            if (!model) console.error(`🚨 UNDEFINED MODEL FOUND: ${name}`);
        });
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
                                        { model: OutcomeIndicator, as: 'LibraryIndicator' }, 
                                        { model: SpOutcomeIndicatorTarget, as: 'Targets' },
                                        { model: Office, as: 'ResponsibleOffice' } // NEW: Include Office
                                    ] 
                                },
                                {
                                    model: SpIntermediateOutcome,
                                    as: 'SelectedIntermediates',
                                    include: [
                                        { model: IntermediateOutcome, as: 'LibraryIntermediate' },
                                        {
                                            model: SpIntermediateOutcomeIndicator,
                                            as: 'SelectedIndicators',
                                            include: [
                                                { model: IntermediateOutcomeIndicator, as: 'LibraryIndicator' },
                                                { model: SpIntermediateOutcomeIndicatorTarget, as: 'Targets' },
                                                { model: Office, as: 'ResponsibleOffice' } // NEW: Include Office
                                            ]
                                        },
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
                                                                { model: OutputIndicator, as: 'LibraryIndicator' },
                                                                { model: SpOutputIndicatorTarget, as: 'Targets' },
                                                                { model: Office, as: 'ResponsibleOffice' } // NEW: Include Office
                                                            ] 
                                                        },
                                                        { 
                                                            model: SpOutputAction, 
                                                            as: 'SelectedActions', 
                                                            include: [
                                                                { model: OutputAction, as: 'LibraryAction' },
                                                                { model: SpOutputActionBudget, as: 'Budgets' },
                                                                { model: Office, as: 'ResponsibleOffice' }, // NEW: Include Office
                                                                { model: BudgetSource, as: 'BudgetSource' } // NEW: Include Source
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

       // FY Year Calculation (Optimized for Integer fy)
        let years = [];

        if (plan.Call && plan.Call.fy) {
            // No more split('/') needed! 
            // We ensure it's a number just in case, then loop.
            const startYear = parseInt(plan.Call.fy); 
            
            // Generates [2025, 2026, 2027, 2028, 2029]
            years = Array.from({ length: 5 }, (_, i) => startYear + i);
        }

        res.render('mda/plan-editor', {
            title: 'Setup Strategic Plan: Full Framework',
            plan,
            libraryObjectives,
            offices,        // NEW: Pass to Pug
            budgetSources,  // NEW: Pass to Pug
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
        console.log(error)
        res.status(500).json({ error: error.message });
    }
};
exports.addOutcome = async (req, res) => {
    try {
        // MATCH THE REQ.BODY KEYS EXACTLY
        const { spObjectiveId, outcomeId } = req.body; 
        
        console.log("Extracted values:", { spObjectiveId, outcomeId });

        // Perform the create
        const selection = await SpOutcome.create({
            spObjectiveId: spObjectiveId,
            outcomeId: outcomeId
        });

        res.status(201).json({ 
            status: 'success', 
            message: 'Outcome successfully linked to objective',
            data: selection 
        });

    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'This outcome has already been added to this objective.' 
            });
        }

        console.error("Save Outcome Error:", error);
        // Tip: Added error.message here so you can see exactly what failed in the response
        res.status(500).json({ 
            status: 'error', 
            message: error.message || 'An internal error occurred while saving the outcome.' 
        });
    }
};

// Save Indicator and its Annual Targets
exports.saveOutcomeIndicator = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { 
            id, 
            spOutcomeId, 
            outcomeIndicatorId, 
            baselineValue, 
            adaptedOutcomeIndicator,
            responsibleOfficeId,
            dataSource,
            targets 
        } = req.body;
        console.log(req.body)
        
        // Note: planId is intentionally removed from here

        let indicator;

        // Prepare consistent data object (No planId)
        const indicatorData = {
            outcomeIndicatorId,
            spOutcomeId,
            baselineValue,
            responsibleOfficeId: responsibleOfficeId || null,
            dataSource: dataSource || null,
            adaptedOutcomeIndicator: adaptedOutcomeIndicator || null
        };

        // 1. Logic Switch: Update or Find/Create
        if (id) {
            indicator = await SpOutcomeIndicator.findByPk(id, { transaction: t });
            if (indicator) {
                await indicator.update(indicatorData, { transaction: t });
            }
        }

        if (!indicator) {
            // REMOVED planId from the 'where' clause here
            [indicator] = await SpOutcomeIndicator.findOrCreate({
                where: { 
                    spOutcomeId, 
                    outcomeIndicatorId 
                },
                defaults: indicatorData,
                transaction: t
            });
            
            // Sync if findOrCreate matched an existing record
            await indicator.update(indicatorData, { transaction: t });
        }

        // 2. Handle the Annual Targets
        await SpOutcomeIndicatorTarget.destroy({
            where: { spOutcomeIndicatorId: indicator.id },
            transaction: t
        });

        if (targets && Object.keys(targets).length > 0) {
            const targetRecords = Object.entries(targets)
                .filter(([year, value]) => value !== '' && value !== null)
                .map(([year, value]) => ({
                    spOutcomeIndicatorId: indicator.id,
                    fy: year,
                    val: value
                }));

            if (targetRecords.length > 0) {
                await SpOutcomeIndicatorTarget.bulkCreate(targetRecords, { transaction: t });
            }
        }

        await t.commit();
        res.json({ status: 'success', message: 'Indicator and targets saved successfully' });

    } catch (error) {
        if (t) await t.rollback();
        console.error("Error saving outcome indicator:", error);
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

//INTERMEDIATE OUTCOMES
exports.getLibraryIntermediates = async (req, res) => {

    try {
        const { spOutcomeId } = req.params;

        const spOutcome = await SpOutcome.findByPk(spOutcomeId);

        const intermediates = await IntermediateOutcome.findAll({
            where: { outcomeId: spOutcome.outcomeId },
            // Using the actual field names from your .init
            attributes: ['id', 'intermediateOutcome'], 
            order: [['intermediateOutcome', 'ASC']]
        });

        res.json(intermediates);
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message });
    }
};
exports.addIntermediateOutcome = async (req, res) => {
    try {
        // planId is removed as it's now redundant (accessible via spOutcomeId)
        const { spOutcomeId, libraryIntId } = req.body;

        if (!spOutcomeId || !libraryIntId) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Missing required fields: Outcome ID or Intermediate Selection' 
            });
        }

        // Create the record in sp_intermediate_outcomes
        const [record, created] = await SpIntermediateOutcome.findOrCreate({
            where: { 
                spOutcomeId: spOutcomeId, 
                intermediateOutcomeId: libraryIntId // Points to the Library PK
            },
            defaults: { 
                spOutcomeId: spOutcomeId, 
                intermediateOutcomeId: libraryIntId
            }
        });

        if (!created) {
            return res.json({ 
                status: 'warning', 
                message: 'This Intermediate Outcome is already attached to this Outcome.' 
            });
        }

        res.json({ 
            status: 'success', 
            message: 'Intermediate Outcome added successfully.' 
        });

    } catch (err) {
        console.error("Save Error:", err);
        res.status(500).json({ 
            status: 'error', 
            message: 'Database error: ' + err.message 
        });
    }
};

exports.saveIntermediateOutcomeIndicator = async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        const { 
            id, 
            spIntermediateOutcomeId, 
            intermediateOutcomeIndicatorId, 
            baselineValue, 
            adaptedIntermediateOutcomeIndicator,
            responsibleOfficeId,
            dataSource,
            targets 
        } = req.body;

        let indicator;

        // Clean data: Convert empty strings to null for database safety
        const indicatorData = {
            intermediateOutcomeIndicatorId: intermediateOutcomeIndicatorId || null,
            spIntermediateOutcomeId: spIntermediateOutcomeId || null,
            baselineValue: baselineValue || null,
            responsibleOfficeId: responsibleOfficeId || null,
            dataSource: dataSource || null,
            adaptedIntermediateOutcomeIndicator: adaptedIntermediateOutcomeIndicator || null
        };

        // 1. Logic Switch: Update or Find/Create
        // If id is provided and not an empty string
        if (id && id !== '') {
            indicator = await SpIntermediateOutcomeIndicator.findByPk(id, { transaction: t });
            if (indicator) {
                await indicator.update(indicatorData, { transaction: t });
            }
        } 
        
        if (!indicator) {
            // 1b. ADD MODE: planId is REMOVED from the where clause
            [indicator] = await SpIntermediateOutcomeIndicator.findOrCreate({
                where: { 
                    spIntermediateOutcomeId: indicatorData.spIntermediateOutcomeId, 
                    intermediateOutcomeIndicatorId: indicatorData.intermediateOutcomeIndicatorId
                },
                defaults: indicatorData,
                transaction: t
            });

            // Ensure all fields are updated if findOrCreate matched an old record
            await indicator.update(indicatorData, { transaction: t });
        }

        // 2. Refresh Targets
        await SpIntermediateOutcomeIndicatorTarget.destroy({ 
            where: { spIntermediateOutcomeIndicatorId: indicator.id },
            transaction: t 
        });

        if (targets && Object.keys(targets).length > 0) {
            const targetEntries = Object.entries(targets)
                .filter(([year, val]) => val !== '' && val !== null) 
                .map(([year, val]) => ({
                    spIntermediateOutcomeIndicatorId: indicator.id,
                    fy: year, 
                    val: val
                }));
            
            if (targetEntries.length > 0) {
                await SpIntermediateOutcomeIndicatorTarget.bulkCreate(targetEntries, { transaction: t });
            }
        }

        await t.commit();
        res.json({ status: 'success', message: 'Indicator and Targets saved successfully' });
    } catch (err) {
        if (t) await t.rollback();
        console.error("Save Error:", err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.saveIntervention = async (req, res) => {
    try {
        // 1. Removed planId from destructuring
        const { id, spIntermediateOutcomeId, libraryInterventionId } = req.body;

        // 2. Validation
        if (!spIntermediateOutcomeId) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Missing Parent Intermediate Outcome ID' 
            });
        }

        if (id && id !== '') {
            // EDIT MODE: Update existing record
            // Removed planId from the update object
            await SpIntervention.update(
                { spIntermediateOutcomeId, interventionId: libraryInterventionId },
                { where: { id } }
            );
            return res.json({ status: 'success', message: 'Intervention updated successfully' });
        } else {
            // ADD MODE: Link new intervention
            // Removed planId from where and defaults
            const [record, created] = await SpIntervention.findOrCreate({
                where: { 
                    spIntermediateOutcomeId, 
                    interventionId: libraryInterventionId
                },
                defaults: { 
                    spIntermediateOutcomeId, 
                    interventionId: libraryInterventionId 
                }
            });

            if (!created) {
                return res.json({ status: 'info', message: 'This intervention is already linked.' });
            }

            return res.json({ status: 'success', message: 'Intervention linked successfully' });
        }
    } catch (err) {
        console.error("Save Intervention Error:", err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.getLibraryIntIndicators = async (req, res) => {
    try {
        const { spIntermediateOutcomeId } = req.params;
        console.log(req.params)
        const spInt = await SpIntermediateOutcome.findByPk(spIntermediateOutcomeId);
        
        
        const indicators = await IntermediateOutcomeIndicator.findAll({
            where: { intermediateOutcomeId: spInt.intermediateOutcomeId }
        });
        res.json(indicators);
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message });
    }
};

exports.getLibraryInterventions = async (req, res) => {
    try {
        const { spIntermediateOutcomeId } = req.params;
        const spInt = await SpIntermediateOutcome.findByPk(spIntermediateOutcomeId);
        
        const interventions = await Intervention.findAll({
            where: { intermediateOutcomeId: spInt.intermediateOutcomeId }
        });
        res.json(interventions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// DELETE Outcome
exports.deleteOutcome = async (req, res) => {
    try {
        const { id } = req.params;
        // If your DB has ON DELETE CASCADE, this single line deletes everything below it
        await SpOutcome.destroy({ where: { id } });
        
        res.json({ status: 'success', message: 'Outcome and related items removed.' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// DELETE Intermediate Outcome
exports.deleteIntermediate = async (req, res) => {
    try {
        await SpIntermediateOutcome.destroy({ where: { id: req.params.id } });
        res.json({ status: 'success', message: 'Intermediate Outcome removed.' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// DELETE Intervention
exports.deleteIntervention = async (req, res) => {
    try {
        await SpIntervention.destroy({ where: { id: req.params.id } });
        res.json({ status: 'success', message: 'Intervention removed.' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};


exports.deleteIndicator = async (req, res) => {
    const { level, id } = req.params;
    const t = await sequelize.transaction();

    try {
        // 1. Determine which models to use
        const modelMap = {
            'outcome': { 
                main: SpOutcomeIndicator, 
                target: SpOutcomeIndicatorTarget,
                key: 'spOutcomeIndicatorId' 
            },
            'intermediate': { 
                main: SpIntermediateOutcomeIndicator, 
                target: SpIntermediateOutcomeIndicatorTarget,
                key: 'spIntermediateOutcomeIndicatorId' 
            },
            'output': { 
                main: SpOutputIndicator, 
                target: SpOutputIndicatorTarget,
                key: 'spOutputIndicatorId' 
            }
        };

        const targetModel = modelMap[level.toLowerCase()];
        if (!targetModel) throw new Error('Invalid indicator level');

        // 2. Delete Targets first (Foreign Key constraint safety)
        await targetModel.target.destroy({ 
            where: { [targetModel.key]: id }, 
            transaction: t 
        });

        // 3. Delete the Indicator Link
        await targetModel.main.destroy({ 
            where: { id }, 
            transaction: t 
        });

        await t.commit();
        res.json({ success: true, message: `${level} indicator removed.` });

    } catch (err) {
        if (t) await t.rollback();
        res.status(500).json({ success: false, message: err.message });
    }
};
// Function name explicitly specifies 'Library'
exports.getLibraryOutputsByIntervention = async (req, res) => {
    try {
        const { spInterventionId } = req.params;

        // 1. Find the MDA's selection record (Instance)
        // Ensure SpIntervention is imported and has interventionId mapped to intervention_id
        const interventionLink = await SpIntervention.findByPk(spInterventionId);
        
        if (!interventionLink) {
            return res.status(404).json({ message: 'Intervention link not found' });
        }

        // 2. Fetch the National Library Outputs (Templates)
        const libraryOutputs = await Output.findAll({
            where: { 
                // Uses the camelCase property name from Output.init
                interventionId: interventionLink.interventionId 
            },
            // Use the JS property name 'outputCode' to ensure Sequelize 
            // maps it correctly to the 'output_code' column
            order: [['outputCode', 'ASC']]
        });

        // 3. Send JSON back to the frontend
        // This will include outputCode and outputDescription (mapped to 'output' in DB)
        res.json(libraryOutputs);

    } catch (error) {
        console.error("Error fetching library outputs:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.saveOutput = async (req, res) => {
    // 1. Destructure only what we need (planId removed)
    const { id, spInterventionId, outputId } = req.body;

    try {
        let output;

        // Validation to prevent orphan records
        if (!spInterventionId && (!id || id === '')) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Missing Parent Intervention ID' 
            });
        }

        if (id && id !== '') {
            // EDIT MODE: Update the existing link
            output = await SpOutput.findByPk(id);
            if (output) {
                // Update only the pointer to the library output
                await output.update({ outputId });
            }
        } else {
            // ADD MODE: Create link using Parent ID and Library ID
            // Removed planId from where and defaults
            [output] = await SpOutput.findOrCreate({
                where: { 
                    spInterventionId, 
                    outputId 
                },
                defaults: {
                    spInterventionId,
                    outputId
                }
            });
        }

        res.json({ 
            status: 'success', 
            message: 'Output linked to intervention successfully' 
        });

    } catch (error) {
        console.error("Save Output Error:", error);
        res.status(500).json({ 
            status: 'error', 
            message: error.name === 'SequelizeUniqueConstraintError' 
                ? 'This Output is already linked to this intervention.' 
                : error.message 
        });
    }
};
exports.deleteOutput = async (req, res) => {
    const { id } = req.params; // The ID of the SpOutput record
    const t = await sequelize.transaction();

    try {
        // 1. Find the output to ensure it exists
        const output = await SpOutput.findByPk(id, { transaction: t });
        if (!output) {
            return res.status(404).json({ status: 'error', message: 'Output record not found' });
        }

        // 2. Delete child Indicators and their Targets first
        // Note: If you have 'ON DELETE CASCADE' in DB, this is handled automatically,
        // but explicit deletion is safer for complex logic.
        const indicators = await SpOutputIndicator.findAll({ where: { spOutputId: id }, transaction: t });
        const indicatorIds = indicators.map(i => i.id);

        if (indicatorIds.length > 0) {
            await SpOutputIndicatorTarget.destroy({ where: { spOutputIndicatorId: indicatorIds }, transaction: t });
            await SpOutputIndicator.destroy({ where: { spOutputId: id }, transaction: t });
        }

        // 3. Delete child Actions
        await SpOutputAction.destroy({ where: { spOutputId: id }, transaction: t });

        // 4. Finally, delete the Output itself
        await output.destroy({ transaction: t });

        await t.commit();
        res.json({ status: 'success', message: 'Output and all associated data deleted successfully' });

    } catch (error) {
        if (t) await t.rollback();
        console.error("Delete Output Error:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.getLibraryOutputIndicators = async (req, res) => {
    try {
        // 1. Get the ID from the URL. 
        // Ensure this matches the name in your route: /api/library/output-indicators/:spOutputId
        const { spOutputId } = req.params; 

        // 2. Find the "Selected Output" (the MDA's choice)
        const selectedOutput = await SpOutput.findByPk(spOutputId);
        
        if (!selectedOutput) {
            return res.status(404).json({ success: false, message: 'Strategic Plan Output not found' });
        }

        // 3. Fetch indicators from the Library linked to the Library Output ID
        const indicators = await OutputIndicator.findAll({
            where: { 
                // Use the library ID (outputId) found on the SpOutput record
                outputId: selectedOutput.outputId 
            },
            attributes: ['id', 'indicator', 'indicatorCode'],
            // Use underscored name if your DB uses indicator_code
            order: [['indicator_code', 'ASC']] 
        });

        res.json(indicators);
    } catch (error) {
        console.error('Error fetching library output indicators:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.saveOutputIndicator = async (req, res) => {
    // 1. Remove planId from destructuring
    const { 
        id, 
        spOutputId, 
        outputIndicatorId, 
        baselineValue, 
        adaptedOutputIndicator,
        responsibleOfficeId,
        dataSource,
        targets 
    } = req.body;

    const transaction = await sequelize.transaction();

    try {
        let indicator;

        // 2. Prepare data object (planId removed)
        const indicatorData = {
            baselineValue,
            outputIndicatorId,
            spOutputId,
            responsibleOfficeId: responsibleOfficeId || null,
            dataSource: dataSource || null,
            adaptedOutputIndicator: adaptedOutputIndicator || null
        };

        // 3. UPDATE OR CREATE LOGIC
        if (id && id !== '') {
            // EDIT MODE
            indicator = await SpOutputIndicator.findByPk(id, { transaction });
            if (!indicator) throw new Error('Indicator record not found');
            
            await indicator.update(indicatorData, { transaction });

        } else {
            // ADD MODE: findOrCreate using only relationship IDs
            [indicator] = await SpOutputIndicator.findOrCreate({
                where: { spOutputId, outputIndicatorId }, // planId REMOVED
                defaults: indicatorData,
                transaction
            });

            // Sync values if findOrCreate matched an existing record
            await indicator.update(indicatorData, { transaction });
        }

        // 4. SAVE ANNUAL TARGETS
        await SpOutputIndicatorTarget.destroy({ 
            where: { spOutputIndicatorId: indicator.id }, 
            transaction 
        });

        if (targets) {
            const targetData = Object.keys(targets)
                .filter(year => targets[year] !== '' && targets[year] !== null)
                .map(year => ({
                    spOutputIndicatorId: indicator.id,
                    fy: year,
                    val: targets[year]
                    // Note: If SpOutputIndicatorTarget still has a plan_id column, 
                    // you may need to remove it from there too.
                }));

            if (targetData.length > 0) {
                await SpOutputIndicatorTarget.bulkCreate(targetData, { transaction });
            }
        }

        await transaction.commit();
        
        res.json({ 
            status: 'success', 
            message: 'Output Indicator and targets saved successfully' 
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Save Output Indicator Error:", error);
        
        res.status(500).json({ 
            status: 'error', 
            message: error.name === 'SequelizeUniqueConstraintError' 
                ? 'This indicator has already been added to this output.' 
                : error.message 
        });
    }
};


//OUTPUT ACTIONS

exports.getLibraryActionsByOutput = async (req, res) => {
    try {
        const { spOutputId } = req.params;
        const outputLink = await SpOutput.findByPk(spOutputId);
        
        if (!outputLink) return res.status(404).json({ message: 'Output link not found' });

        const libraryActions = await OutputAction.findAll({
            where: { outputId: outputLink.outputId },
            order: [['action_code', 'ASC']]
        });

        res.json(libraryActions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.saveOutputAction = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        // 1. Removed planId from destructuring
        const { 
            id, 
            spOutputId, 
            outputActionId, 
            adaptedOutputAction, 
            responsibleOfficeId, 
            budgetSourceId,      
            budgets              
        } = req.body;

        let actionRecord;

        // 2. Prepare the data object (planId removed)
        const actionData = {
            outputActionId,
            spOutputId,
            adaptedOutputAction: adaptedOutputAction || null,
            responsibleOfficeId: responsibleOfficeId || null, 
            budgetSourceId: budgetSourceId || null           
        };

        // 3. Update or Create Logic
        if (id && id !== '') {
            actionRecord = await SpOutputAction.findByPk(id, { transaction: t });
            if (actionRecord) {
                await actionRecord.update(actionData, { transaction: t });
            }
        } else {
            // Using findOrCreate without planId in the 'where' clause
            [actionRecord] = await SpOutputAction.findOrCreate({
                where: { spOutputId, outputActionId }, 
                defaults: actionData,
                transaction: t
            });
            
            // If it already existed, ensure the update happens
            await actionRecord.update(actionData, { transaction: t });
        }

        // 4. Handle Annual Budgets (Wipe and Re-insert)
        await SpOutputActionBudget.destroy({ 
            where: { spOutputActionId: actionRecord.id }, 
            transaction: t 
        });

        if (budgets && Object.keys(budgets).length > 0) {
            const budgetEntries = Object.entries(budgets)
                .filter(([year, val]) => val !== '' && val !== null)
                .map(([year, val]) => ({
                    spOutputActionId: actionRecord.id,
                    fy: year,
                    val: val
                    // planId is removed from here as well!
                }));

            if (budgetEntries.length > 0) {
                await SpOutputActionBudget.bulkCreate(budgetEntries, { transaction: t });
            }
        }

        await t.commit();
        res.json({ status: 'success', message: 'Action and Budgets saved successfully' });
    } catch (err) {
        if (t) await t.rollback();
        console.error("Save Action Error:", err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};


exports.deleteOutputAction = async (req, res) => {
    const { id } = req.params; // The ID of the SpOutputAction record
    const t = await sequelize.transaction();

    try {
        // 1. Verify the action exists
        const action = await SpOutputAction.findByPk(id, { transaction: t });
        if (!action) {
            return res.status(404).json({ status: 'error', message: 'Action record not found' });
        }

        // 2. Delete associated Budgets first
        await SpOutputActionBudget.destroy({ 
            where: { spOutputActionId: id }, 
            transaction: t 
        });

        // 3. Delete the Action record
        await action.destroy({ transaction: t });

        await t.commit();
        res.json({ status: 'success', message: 'Action and its budgets deleted successfully' });

    } catch (error) {
        if (t) await t.rollback();
        console.error("Delete Action Error:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};


exports.getIndicatorDetails = async (req, res) => {

    try {
        const { level, id } = req.params;
        let model, targetModel, targetAlias = 'Targets';

        // Match the level to the correct Sequelize Model
        if (level === 'outcome') {
            model = SpOutcomeIndicator;
        } else if (level === 'intermediate') {
            model = SpIntermediateOutcomeIndicator;
        } else if (level === 'output') {
            model = SpOutputIndicator;
        }


        if (!model) return res.status(400).json({ success: false, message: 'Invalid level' });

        const data = await model.findByPk(id, {
            include: [{ 
                model: model.associations.Targets.target, // Safely get the Target model
                as: 'Targets' 
            }]
        });

        if (!data) {
            return res.status(404).json({ success: false, message: 'Resource Not Found' });
        }

        res.json(data);
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};