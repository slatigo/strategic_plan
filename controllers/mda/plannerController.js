const { StrategicPlan, PlanCall, Mda, User, PlanReview, Programme }= require('../../models');
const { Op } = require('sequelize');

exports.getDashboard = async (req, res) => {
    try {
        const mdaId = req.user.mdaId;

        // 1. Fetch existing plans for this MDA
        const myPlans = await StrategicPlan.findAll({
           where: { mdaId: mdaId },
            include: [
                { model: PlanCall, as: 'Call' },
                { model: Programme, as: 'Programme' }, 
                { 
                    model: PlanReview, 
                    as: 'Reviews', 
                    limit: 1, 
                    order: [['created_at', 'DESC']] 
                }
            ],
            order: [['recorded', 'DESC']]
        });

        // 2. FETCH OPEN CALLS (This was missing!)
        // We fetch active fiscal year calls so the user can select one in the modal
        const openCalls = await PlanCall.findAll({
            where: { status: 'Open' } // Adjust 'Open' to whatever your status field uses
        });

        // 3. Fetch all available programmes for the dropdown
        const availableProgrammes = await Programme.findAll({
            attributes: ['id', 'programmeName', 'programmeCode'], // Use camelCase as defined in Model
            order: [['programmeName', 'ASC']]
        });

        // 4. Render the view with all necessary data
        res.render('mda/dashboard', {
            title: 'Planner Dashboard',
            myPlans,
            openCalls,           // Now correctly defined
            availableProgrammes, 
            user: req.user
        });
        
    } catch (error) {
        console.error("Dashboard Loading Error:", error);
        res.status(500).send("Error loading dashboard");
    }
};
