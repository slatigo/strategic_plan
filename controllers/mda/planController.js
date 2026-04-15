const { 
    // 1. Core Models
    StrategicPlan, 
    Mda, 
    PlanCall, 
    Programme, 
    Office, 
    BudgetSource,
    NationalAlignment,
    NationalValue,

    // 2. Strategic Plan (SP) Instances (The MDA's specific selections)
    SpObjective, 
    SpOutcome, 
    SpOutcomeIndicator, 
    SpOutcomeIndicatorTarget, 
    SpIntermediateOutcome, 
    SpIntermediateOutcomeIndicator, 
    SpIntermediateOutcomeIndicatorTarget, 
    SpIntervention, 
    SpOutput, 
    SpOutputIndicator, 
    SpOutputIndicatorTarget, 
    SpOutputAction, 
    SpOutputActionBudget,

    // 3. Library Models (The global templates/base definitions)
    Objective, 
    Outcome, 
    OutcomeIndicator, 
    IntermediateOutcome, 
    IntermediateOutcomeIndicator, 
    Intervention, 
    Output, 
    OutputIndicator, 
    OutputAction,
    PlanComment,
    User,

    // 4. Utilities
    Sequelize,
    sequelize 
} = require('../../models'); // Adjust path based on your file's location

// Adjust the path (../../) to point to your models folder
const { fullPlanStructure } = require('../../utils/planIncludes');
const { Op } = require('sequelize');
const AppError = require('../../utils/appError');
exports.getPlansLanding = async (req, res) => {
  try {
    const mdaId = req.user.mdaId;

    // Fetch plans with all associations defined in your model
    const plans = await StrategicPlan.findAll({
      where: { mdaId: mdaId },
      include: [
        { model: PlanCall, as: 'Call' },
        { model: Programme, as: 'Programme' },
        { model: SpObjective, as: 'SelectedObjectives' } 
      ],
      order: [['recorded', 'DESC']]
    });

    // Fetch Open Calls separately to handle the "Start New Plan" dropdown
    const openCalls = await PlanCall.findAll({ 
      where: { status: 'Open' },
      order: [['deadline', 'ASC']]
    });

    res.render('mda/plans/index', {
      title: 'Strategic Plans Management',
      activePage: 'plans',
      plans: plans.map(p => p.get({ plain: true })),
      openCalls: openCalls.map(c => c.get({ plain: true })),
      user: req.user
    });
  } catch (error) {
    console.error("Plan Landing Error:", error);
    res.status(500).send('Error loading plans');
  }
};
exports.startNewPlan = async (req, res) => {
    try {
        const { call_id, programme_id } = req.body;
        const mda_id = req.user.mdaId; // From middleware
        const user_id = req.user.id;

        // 1. Double check existence using the Model Property Names
        const existing = await StrategicPlan.findOne({ 
            where: { 
                callId: call_id,  // Use camelCase from model
                mdaId: mda_id     // Changed from org_id
            } 
        });

        if (existing) {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'A plan for this fiscal year has already been initiated.' 
            });
        }

        // 2. Create the Record using the Model Property Names
        const newPlan = await StrategicPlan.create({
            callId: call_id,      // Use camelCase
            mdaId: mda_id,        // Changed from org_id
            userId: user_id,      // Use camelCase
            programmeId: programme_id, 
            status: 'Draft',
            recorded: new Date()
        });

        res.status(201).json({ 
            status: 'success', 
            planId: newPlan.id 
        });

    } catch (error) {
        console.error("Start Plan Error:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};


exports.getPlanEditor = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Fetch lookup tables and Plan in parallel
        // We use raw: true, nest: true to get a clean JSON object without class overhead
        const [offices, budgetSources, plan] = await Promise.all([
            Office.findAll({ 
                where: { mdaId: req.user.mdaId }, 
                order: [['name', 'ASC']],
                raw: true // Optimization: Raw data
            }),
            BudgetSource.findAll({ 
                where: { mdaId: req.user.mdaId }, 
                order: [['name', 'ASC']],
                raw: true // Optimization: Raw data
            }),
            StrategicPlan.findByPk(id, {
                include: [...fullPlanStructure, {
                    model: PlanComment,
                    as: 'Comments',
                    include: [{ model: User, as: 'Author', attributes: ['name'] }],
                    separate: true, // Keep separate for deep includes
                    order: [['createdAt', 'DESC']]
                }],
                // REMOVED order clause from here to prevent SQL join errors
            })
        ]);

        if (!plan) return res.status(404).send("Plan not found");

        // 2. Sort the data in memory (Fastest approach for deep structures)
        if (plan.SelectedObjectives && Array.isArray(plan.SelectedObjectives)) {
            plan.SelectedObjectives.sort((a, b) => {
                // Safely extract the codes, defaulting to empty strings
                const codeA = (a.LibraryObjective && a.LibraryObjective.objective_code) ? String(a.LibraryObjective.objective_code) : '';
                const codeB = (b.LibraryObjective && b.LibraryObjective.objective_code) ? String(b.LibraryObjective.objective_code) : '';
                
                return codeA.localeCompare(codeB);
            });
        }

        // 3. Convert to plain object (if not already raw)
        const planData = plan.get({ plain: true });

        // 4. Fetch library objectives
        const selectedObjIds = planData.SelectedObjectives.map(obj => obj.objectiveId);
        
        // FIXED: Added proper condition for Op.notIn
        const libraryObjectives = await Objective.findAll({
            where: { 
                programmeId: planData.programmeId,
                ...(selectedObjIds.length > 0 && {
                    id: { [Op.notIn]: selectedObjIds }
                })
            },
            order: [['objective_code', 'ASC']],
            raw: true
        });

        // 5. Logic & Render
        const isPrintMode = req.query.print === 'true';
        const isLocked = isPrintMode ? true : !['Draft', 'Revision Required'].includes(planData.status);
        
        let years = [];
        if (planData.Call && planData.Call.fy) {
            const startYear = parseInt(planData.Call.fy); 
            years = Array.from({ length: 5 }, (_, i) => startYear + i);
        }

        res.render(isPrintMode ? 'mda/plans/plan-print' : 'mda/plans/editor', {
            title: 'Setup Strategic Plan: Full Framework',
            plan: planData,
            libraryObjectives,
            offices,
            budgetSources,
            isPrintMode,
            isLocked,
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
            id, spOutcomeId, outcomeIndicatorId, 
            is_custom, customIndicatorName, customUnit, 
            baselineValue, adaptedOutcomeIndicator,
            responsibleOfficeId, dataSource, targets 
        } = req.body;

        // prepare data based on your SpOutcomeIndicator.init schema
        const indicatorData = {
            spOutcomeId,
            baselineValue,
            responsibleOfficeId: responsibleOfficeId || null,
            dataSource: dataSource || null,
            outcome_indicator_id: is_custom === 'on' ? null : outcomeIndicatorId,
            
            // Fix for "cannot be null" error:
            // If custom, use the custom name. 
            // If library but empty adaptation, provide an empty string to satisfy NOT NULL.
            adaptedOutcomeIndicator: is_custom === 'on' 
                ? (customIndicatorName || "Unnamed Custom Indicator") 
                : (adaptedOutcomeIndicator || ""),
            
            // Match the model column name: unitOfMeasure
            unitOfMeasure: is_custom === 'on' ? customUnit : null 
        };

        let indicator;
        if (id) {
            indicator = await SpOutcomeIndicator.findByPk(id, { transaction: t });
            if (indicator) await indicator.update(indicatorData, { transaction: t });
        } else {
            if (is_custom === 'on') {
                indicator = await SpOutcomeIndicator.create(indicatorData, { transaction: t });
            } else {
                [indicator] = await SpOutcomeIndicator.findOrCreate({
                    where: { spOutcomeId, outcomeIndicatorId },
                    defaults: indicatorData,
                    transaction: t
                });
                await indicator.update(indicatorData, { transaction: t });
            }
        }

        // Handle Targets (Logic remains same)
        await SpOutcomeIndicatorTarget.destroy({
            where: { spOutcomeIndicatorId: indicator.id },
            transaction: t
        });

        if (targets && Object.keys(targets).length > 0) {
            const targetRecords = Object.entries(targets)
                .filter(([yr, val]) => val !== '' && val !== null)
                .map(([yr, val]) => ({
                    spOutcomeIndicatorId: indicator.id,
                    fy: yr,
                    val: val.replace(/,/g, '') // sanitize
                }));

            if (targetRecords.length > 0) {
                await SpOutcomeIndicatorTarget.bulkCreate(targetRecords, { transaction: t });
            }
        }

        await t.commit();
        res.json({ status: 'success', message: 'Indicator saved successfully' });
    } catch (error) {
        if (t) await t.rollback();
        console.error("Save Error:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.getLibraryIndicatorsBySpOutcome = async (req, res) => {
  try {
    const { spOutcomeId } = req.params;
    const selection = await SpOutcome.findByPk(spOutcomeId);
    
    if (!selection) {
      return res.status(404).json({ error: "Strategic Plan Outcome not found" });
    }

    // Find indicators with their National Alignment and NDP Yearly Targets
    const indicators = await OutcomeIndicator.findAll({
      where: { outcomeId: selection.outcomeId },
      include: [{
        model: NationalAlignment,
        as: 'OutcomeNational', // Ensure this alias matches your OutcomeIndicator model association
        include: [{
          model: NationalValue,
          as: 'YearlyValues', // Matches the 'as' in your NationalAlignment model
          attributes: ['target_year', 'value', 'remarks']
        }]
      }],
      order: [['indicatorCode', 'ASC']]
    });

    res.json(indicators);
  } catch (err) {
    console.error("Fetch Library Indicators Error:", err);
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
            is_custom,           
            customIndicatorName, 
            customUnit,          
            baselineValue, 
            adaptedIntermediateOutcomeIndicator,
            responsibleOfficeId,
            dataSource,
            targets 
        } = req.body;

        // DEBUG: View exactly what came from the browser
        console.log("RAW REQ BODY:", req.body);

        // 1. Prepare consistent data object
        // NOTE: Check your SpIntermediateOutcomeIndicator model. 
        // If the field is 'unit_of_measure', change 'unitOfMeasure' below to match.
        const indicatorData = {
            spIntermediateOutcomeId: spIntermediateOutcomeId || null,
            baselineValue: baselineValue ? baselineValue.toString().replace(/,/g, '') : null,
            responsibleOfficeId: responsibleOfficeId || null,
            dataSource: dataSource || null,
            
            // Logic Switch for Library vs Custom
            intermediateOutcomeIndicatorId: is_custom === 'on' ? null : (intermediateOutcomeIndicatorId || null),
            
            // Custom name goes in the adapted column
            adaptedIntermediateOutcomeIndicator: is_custom === 'on' ? customIndicatorName : (adaptedIntermediateOutcomeIndicator || null),
            
            // THE FIX: Use the key that matches your Sequelize Model definition exactly
            unitOfMeasure: is_custom === 'on' ? customUnit : null 
        };

        console.log("DATA SENT TO SEQUELIZE:", indicatorData);

        let indicator;

        // 2. Logic Switch: Update or Find/Create
        if (id && id !== '' && id !== 'undefined' && id !== null) {
            // EDIT MODE
            indicator = await SpIntermediateOutcomeIndicator.findByPk(id, { transaction: t });
            if (indicator) {
                await indicator.update(indicatorData, { transaction: t });
            }
        } 
        
        // 3. If new entry or findByPk failed
        if (!indicator) {
            if (is_custom === 'on') {
                indicator = await SpIntermediateOutcomeIndicator.create(indicatorData, { transaction: t });
            } else {
                [indicator] = await SpIntermediateOutcomeIndicator.findOrCreate({
                    where: { 
                        spIntermediateOutcomeId: indicatorData.spIntermediateOutcomeId, 
                        intermediateOutcomeIndicatorId: indicatorData.intermediateOutcomeIndicatorId
                    },
                    defaults: indicatorData,
                    transaction: t
                });
                // Update in case it existed but baseline/unit changed
                await indicator.update(indicatorData, { transaction: t });
            }
        }

        // 4. Refresh Targets (Delete old, Insert new)
        await SpIntermediateOutcomeIndicatorTarget.destroy({ 
            where: { spIntermediateOutcomeIndicatorId: indicator.id },
            transaction: t 
        });

        if (targets && typeof targets === 'object') {
            const targetEntries = Object.entries(targets)
                .filter(([year, val]) => val !== '' && val !== null) 
                .map(([year, val]) => ({
                    spIntermediateOutcomeIndicatorId: indicator.id,
                    fy: year, 
                    val: val.toString().replace(/,/g, '') 
                }));
            
            if (targetEntries.length > 0) {
                await SpIntermediateOutcomeIndicatorTarget.bulkCreate(targetEntries, { transaction: t });
            }
        }

        await t.commit();
        res.json({ 
            status: 'success', 
            message: 'Indicator and Targets saved successfully', 
            id: indicator.id 
        });

    } catch (err) {
        if (t) await t.rollback();
        console.error("SAVE INTERMEDIATE INDICATOR ERROR:", err);
        res.status(500).json({ 
            status: 'error', 
            message: err.message 
        });
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
        
        // 1. Find the link to the library
        const spInt = await SpIntermediateOutcome.findByPk(spIntermediateOutcomeId);
        if (!spInt) return res.status(404).json({ error: "Intermediate Outcome selection not found" });

        // 2. Fetch indicators with National Alignment and NDP targets
        const indicators = await IntermediateOutcomeIndicator.findAll({
            where: { intermediateOutcomeId: spInt.intermediateOutcomeId },
            include: [{
                model: NationalAlignment,
                as: 'IntermediateNational', // Alias in your IntermediateOutcomeIndicator model
                include: [{
                    model: NationalValue,
                    as: 'YearlyValues', // Alias in your NationalAlignment model
                    attributes: ['target_year', 'value']
                }]
            }],
            order: [['indicatorCode', 'ASC']]
        });

        res.json(indicators);
    } catch (err) {
        console.error("Error fetching Intermediate Indicators:", err);
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
        const { spOutputId } = req.params; 

        // 1. Find the Strategic Plan Output (The link between MDA and Library)
        const selectedOutput = await SpOutput.findByPk(spOutputId);
        
        if (!selectedOutput) {
            return res.status(404).json({ success: false, message: 'Strategic Plan Output not found' });
        }

        // 2. Fetch indicators WITH National Alignment and NDP targets
        const indicators = await OutputIndicator.findAll({
            where: { 
                outputId: selectedOutput.outputId 
            },
            // Include the National Alignment logic so the frontend can show NDP benchmarks
            include: [{
                model: NationalAlignment,
                as: 'OutputNational', // Must match the alias in your OutputIndicator model
                include: [{
                    model: NationalValue,
                    as: 'YearlyValues', // Must match the alias in your NationalAlignment model
                    attributes: ['target_year', 'value']
                }]
            }],
            // Use attributes to keep the payload clean
            attributes: ['id', 'indicator', 'indicatorCode'],
            order: [['indicatorCode', 'ASC']] 
        });

        res.json(indicators);
    } catch (error) {
        console.error('Error fetching library output indicators:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.saveOutputIndicator = async (req, res) => {
    // 1. Destructure fields from req.body
    const { 
        id, 
        spOutputId, 
        outputIndicatorId, 
        is_custom,           
        customIndicatorName, 
        customUnit,          
        baselineValue, 
        adaptedOutputIndicator,
        responsibleOfficeId,
        dataSource,
        targets 
    } = req.body;

    const transaction = await sequelize.transaction();

    try {
        let indicator;

        // 2. Prepare data object
        const indicatorData = {
            // Remove commas from baseline strings before saving
            baselineValue: baselineValue ? baselineValue.toString().replace(/,/g, '') : null,
            spOutputId,
            responsibleOfficeId: responsibleOfficeId || null,
            dataSource: dataSource || null,
            
            // Logic Switch: Custom vs Library
            outputIndicatorId: is_custom === 'on' ? null : (outputIndicatorId || null),
            
            // If custom, use the name input; otherwise use the adaptation text
            adaptedOutputIndicator: is_custom === 'on' ? customIndicatorName : (adaptedOutputIndicator || null),
            
            // Ensure this key matches your Sequelize Model (unitOfMeasure)
            unitOfMeasure: is_custom === 'on' ? customUnit : null 
        };

        // 3. UPDATE OR CREATE LOGIC
        if (id && id !== '' && id !== 'undefined' && id !== null) {
            // EDIT MODE
            indicator = await SpOutputIndicator.findByPk(id, { transaction });
            if (!indicator) throw new Error('Indicator record not found');
            
            await indicator.update(indicatorData, { transaction });

        } else {
            // ADD MODE
            if (is_custom === 'on') {
                // Always create a fresh record for custom entries
                indicator = await SpOutputIndicator.create(indicatorData, { transaction });
            } else {
                // For library indicators, find existing or create new for this parent output
                [indicator] = await SpOutputIndicator.findOrCreate({
                    where: { 
                        spOutputId, 
                        outputIndicatorId: indicatorData.outputIndicatorId 
                    },
                    defaults: indicatorData,
                    transaction
                });

                // Sync values in case the library record already existed but baseline/unit changed
                await indicator.update(indicatorData, { transaction });
            }
        }

        // 4. SAVE ANNUAL TARGETS
        // First, clear existing targets for this specific record
        await SpOutputIndicatorTarget.destroy({ 
            where: { spOutputIndicatorId: indicator.id }, 
            transaction 
        });

        if (targets && typeof targets === 'object') {
            const targetData = Object.keys(targets)
                .filter(year => targets[year] !== '' && targets[year] !== null)
                .map(year => ({
                    spOutputIndicatorId: indicator.id,
                    fy: year,
                    // Sanitize numeric value by removing commas
                    val: targets[year].toString().replace(/,/g, '')
                }));

            if (targetData.length > 0) {
                await SpOutputIndicatorTarget.bulkCreate(targetData, { transaction });
            }
        }

        // 5. Commit everything
        await transaction.commit();
        
        res.json({ 
            status: 'success', 
            message: 'Output Indicator and targets saved successfully',
            id: indicator.id 
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Save Output Indicator Error:", error);
        
        let errorMessage = error.message;
        if (error.name === 'SequelizeUniqueConstraintError') {
            errorMessage = 'This indicator has already been added to this output.';
        }
        
        res.status(500).json({ 
            status: 'error', 
            message: errorMessage 
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
        // 1. Log to confirm receipt
        console.log("RECEIVED PAYLOAD:", req.body);

        const data = req.body;

        // 2. Prepare Action Data
        const actionData = {
            spOutputId: data.spOutputId,
            responsibleOfficeId: data.responsibleOfficeId || null,
            budgetSourceId: data.budgetSourceId || null,
            // Logic: if custom is 'on', ignore library ID and use custom name
            outputActionId: data.is_custom === 'on' ? null : (data.outputActionId || null),
            adaptedOutputAction: data.is_custom === 'on' ? data.customActionName : (data.adaptedOutputAction || null)
        };

        let actionRecord;
        
        // 3. Update or Create
        if (data.id && data.id !== '' && data.id !== 'null' && data.id !== 'undefined') {
            actionRecord = await SpOutputAction.findByPk(data.id, { transaction: t });
            if (actionRecord) {
                await actionRecord.update(actionData, { transaction: t });
            }
        } 
        
        if (!actionRecord) {
            actionRecord = await SpOutputAction.create(actionData, { transaction: t });
        }

        // 4. Handle Budgets manually for each year
        // This avoids the regex/nesting issues we had before
        const years = ['2025', '2026', '2027', '2028', '2029'];

        // Clear existing budgets first
        await SpOutputActionBudget.destroy({ 
            where: { spOutputActionId: actionRecord.id }, 
            transaction: t 
        });

        for (const yr of years) {
            // This matches your payload key: budgets
            const budgetKey = `budgets[${yr}]`;
            const budgetVal = data[budgetKey];

            if (budgetVal !== undefined && budgetVal !== '') {
                // Clean the string (remove commas) and convert to number
                const numericAmount = parseFloat(budgetVal.toString().replace(/,/g, '')) || 0;

                await SpOutputActionBudget.create({
                    spOutputActionId: actionRecord.id,
                    fy: yr,
                    val: numericAmount // Verify if your DB column is 'val' or 'amount'
                }, { transaction: t });
                
                console.log(`Saved year ${yr}: ${numericAmount}`);
            }
        }

        await t.commit();
        res.json({ status: 'success', message: 'Saved successfully' });

    } catch (err) {
        if (t) await t.rollback();
        console.error("SAVE ACTION ERROR:", err);
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


exports.submitPlanToNPA = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await StrategicPlan.findByPk(id);

        if (!plan) return res.status(404).json({ message: "Plan not found" });

        // Update status to 'Submitted' (or whatever your NPA status key is)
        plan.status = 'Submitted';
        plan.submittedAt = new Date();
        plan.submittedBy = req.user.id;
        
        await plan.save();

        res.status(200).json({ message: "Successfully submitted to NPA" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};