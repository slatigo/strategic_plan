const { 
    StrategicPlan, 
    Mda, 
    PlanCall, 
    Programme,

    SpObjective, // <--- ADD THIS
    Objective,   // <--- ADD THIS (for the order clause)
    User,
    PlanComment,
    Sequelize 
} = require('../../models');

const { fullPlanStructure } = require('../../utils/planIncludes');
const { Op } = require('sequelize');
const AppError = require('../../utils/appError');

exports.listPlanCalls = async (req, res, next) => {
    try {
        const { Mda, PlanCall, StrategicPlan } = require('../../models');
        const totalMdas = await Mda.count();
        
        const calls = await PlanCall.findAll({
            attributes: {
                include: [
                    // Corrected column name: call_id
                    [Sequelize.literal(`(
                        SELECT COUNT(*) 
                        FROM strategic_plans 
                        WHERE strategic_plans.call_id = PlanCall.id 
                        AND strategic_plans.status = 'Draft'
                    )`), 'countDraft'],
                    
                    [Sequelize.literal(`(
                        SELECT COUNT(*) 
                        FROM strategic_plans 
                        WHERE strategic_plans.call_id = PlanCall.id 
                        AND strategic_plans.status = 'Submitted'
                    )`), 'countSubmitted'],
                    
                    [Sequelize.literal(`(
                        SELECT COUNT(*) 
                        FROM strategic_plans 
                        WHERE strategic_plans.call_id = PlanCall.id 
                        AND strategic_plans.status = 'Approved'
                    )`), 'countApproved'],

                    [Sequelize.literal(`(
                        SELECT COUNT(*) 
                        FROM strategic_plans 
                        WHERE strategic_plans.call_id = PlanCall.id 
                        AND strategic_plans.status = 'Pending Correction'
                    )`), 'countRevision']
                ]
            },
            order: [['created_at', 'DESC']]
        });

        res.render('npa/plan-calls', {
            title: 'Strategic Plan Calls',
            activePage: 'plan-calls',
            calls,
            totalMdas,
            user: req.user
        });
    } catch (error) {
        console.error("Dashboard SQL Error:", error.message);
        next(error);
    }
};
exports.createPlanCall = async (req, res, next) => {
    try {
        let { fy, description, deadline } = req.body;

        // 1. Extract the start year and trim any whitespace
        // " 2025/2030 " -> "2025"
        const startYearStr = (fy.includes('/') ? fy.split('/')[0] : fy).trim();

        // 2. Validate it's actually a 4-digit number
        if (!/^\d{4}$/.test(startYearStr)) {
            return next(new AppError('Please provide a valid 4-digit starting year (e.g., 2025).', 400));
        }

        // 3. Check existence using the string (matches your VARCHAR schema)
        const existing = await PlanCall.findOne({ where: { fy: startYearStr } });
        if (existing) {
            // We use Number() here just for the error message display math
            const endYear = Number(startYearStr) + 5;
            return next(new AppError(`A Strategic Plan for ${startYearStr}/${endYear} already exists.`, 400));
        }

        // 4. Create the record
        const newCall = await PlanCall.create({ 
            fy: startYearStr, // Saves "2025" into your VARCHAR column
            description, 
            deadline 
        });

        res.status(201).json({ 
            status: 'success', 
            message: 'Strategic Plan Call issued successfully!',
            data: newCall 
        });
    } catch (error) {
        next(error);
    }
};

exports.updatePlanCall = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { description, deadline } = req.body;

        const [updatedRows] = await PlanCall.update(
            { description, deadline }, 
            { where: { id } }
        );

        if (updatedRows === 0) {
            return next(new AppError('No plan call found with that ID', 404));
        }

        res.json({ status: 'success', message: 'Call updated successfully' });
    } catch (error) {
        next(error);
    }
};

exports.toggleStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await PlanCall.update({ status }, { where: { id } });
        res.json({ status: 'success', message: `Call is now ${status}` });
    } catch (error) {
        next(new AppError('Failed to update status.', 500));
    }
};

exports.deletePlanCall = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Note: You could add a check here to see if any Indicators are linked
        // before allowing a delete.

        const deleted = await PlanCall.destroy({ where: { id } });
        
        if (!deleted) {
            return next(new AppError('No plan call found with that ID', 404));
        }

        res.json({ status: 'success', message: 'Plan Call deleted successfully.' });
    } catch (error) {
        next(error);
    }
};



exports.viewPlanSubmissions = async (req, res, next) => {
    try {
        const { id } = req.params; // The PlanCall ID (e.g., FY 2025/26)
        const targetCallId = parseInt(id, 10);

        // 1. Fetch the Call Info
        const call = await PlanCall.findByPk(targetCallId);
        if (!call) return res.status(404).send('Strategic Plan Call not found');

        // 2. Fetch all Strategic Plans for this Call
        // We use raw: true to avoid the "Proxy Array" nesting issue
        const allPlans = await StrategicPlan.findAll({
            where: { callId: targetCallId },
            include: [
                { model: Programme, as: 'Programme', attributes: ['programme_name'] },
                { model: User, as: 'Planner', attributes: ['name'] }
            ],
            raw: true,
            nest: true
        });

        // 3. Map plans by mdaId for easy lookup
        const planMap = {};
        allPlans.forEach(p => { planMap[p.mdaId] = p; });

        // 4. Fetch all MDAs (with search)
        const search = req.query.search || '';
        const mdaRows = await Mda.findAll({
            where: search ? { name: { [Op.like]: `%${search}%` } } : {},
            attributes: ['id', 'name', 'code'],
            order: [['name', 'ASC']],
            raw: true
        });

        // 5. Manually Join
        const mdas = mdaRows.map(mda => ({
            ...mda,
            plan: planMap[mda.id] || null
        }));

        res.render('npa/plan-submissions', {
            title: `FY ${call.fy} Submissions`,
            call,
            mdas,
            search,
            user: req.user
        });
    } catch (error) {
        console.error("PLAN SUBMISSION ERROR:", error);
        next(error);
    }
};



exports.reviewPlanSubmission = async (req, res, next) => {
    try {
        const { planId } = req.params;

        const plan = await StrategicPlan.findByPk(planId, {
            include: [
                ...fullPlanStructure,
                { model: Mda, as: 'Mda' },
                // --- ADD THIS BLOCK ---
                {
                    model: PlanComment,
                    as: 'Comments',
                    include: [
                        { 
                            model: User, 
                            as: 'Author', 
                            attributes: ['name', 'role'] // Only get what we need for the UI
                        }
                    ]
                }
            ],
            // We keep your existing order and add order for comments (Oldest to Newest)
            order: [
                [{ model: SpObjective, as: 'SelectedObjectives' }, { model: Objective, as: 'LibraryObjective' }, 'objective_code', 'ASC'],
                [{ model: PlanComment, as: 'Comments' }, 'created_at', 'ASC'] 
            ]
        });

        if (!plan) return res.status(404).send("Strategic Plan not found");

        const startYear = plan.Call ? parseInt(plan.Call.fy) : new Date().getFullYear(); 
        const years = Array.from({ length: 5 }, (_, i) => startYear + i);

        res.render('npa/review-plan', {
            title: `Review: ${plan.Mda.name}`,
            plan,
            years,
            user: req.user
        });
    } catch (error) {
        next(error);
    }
};
exports.submitPlanDecision = async (req, res, next) => {
    try {
        const { planId } = req.params;
        const { status, remarks } = req.body;

        const plan = await StrategicPlan.findByPk(planId);
        if (!plan) return res.status(404).json({ status: 'fail', message: 'Plan not found' });

        // 1. Update the plan status AND the reviewer ID
        await plan.update({ 
            status: status,
            npaAdminId: req.user ? req.user.id : null // Tracks who made the final call
        });

        // 2. Create the comment record (if remarks exist OR if you want to log every status change)
        // Note: I recommend always creating a comment so the "Conversation" shows the status change even if remarks are empty.
        await PlanComment.create({
            planId: plan.id,
            userId: req.user.id,
            message: remarks || `Plan status changed to ${status}`, // Default message if remarks are empty
            statusAtTime: status,
            isAdminComment: true // Identifies this as an NPA action
        });

        res.status(200).json({
            status: 'success',
            message: `Strategic Plan has been marked as ${status}`
        });
    } catch (error) {
        console.error("DECISION ERROR:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};