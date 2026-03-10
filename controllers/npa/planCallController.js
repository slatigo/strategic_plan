const { PlanCall } = require('../../models');

exports.listPlanCalls = async (req, res) => {
    try {
        const calls = await PlanCall.findAll({ 
            order: [['created_at', 'DESC']] 
        });
        res.render('npa/plan-calls', {
            title: 'Strategic Plan Calls',
            activePage: 'plan-calls',
            calls,
            user: req.user
        });
    } catch (error) {
        console.error("Fetch Plan Calls Error:", error);
        res.status(500).render('error', { message: "Could not load planning calls." });
    }
};


exports.createPlanCall = async (req, res) => {
    try {
        const { fy, description, deadline } = req.body;
        
        // 1. Check if a call for this FY already exists
        const existing = await PlanCall.findOne({ where: { fy } });
        if (existing) {
            return res.status(400).json({ status: 'fail', message: `A call for ${fy} already exists.` });
        }

        await PlanCall.create({ fy, description, deadline });
        res.status(201).json({ status: 'success', message: 'Plan Call issued!' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.updatePlanCall = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, deadline } = req.body;
        await PlanCall.update({ description, deadline }, { where: { id } });
        res.json({ status: 'success', message: 'Call updated successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await PlanCall.update({ status }, { where: { id } });
        res.json({ status: 'success', message: `Call is now ${status}` });
    } catch (error) {
        res.status(500).json({ status: 'error', message: "Failed to update status." });
    }
};


exports.deletePlanCall = async (req, res) => {
    try {
        const { id } = req.params;
        
        // In the future, check if Submissions exist before deleting
        // const count = await Submission.count({ where: { plan_call_id: id } });
        // if (count > 0) return res.status(400).json({ message: "Cannot delete call with active submissions." });

        await PlanCall.destroy({ where: { id } });
        res.json({ status: 'success', message: 'Plan Call deleted successfully.' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};