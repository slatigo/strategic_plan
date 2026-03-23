// Make sure these match your index.js exports exactly
const { Mda, User, StrategicPlan, MdaReport } = require('../../models');

exports.getDashboard = async (req, res) => {
    try {
        // Use Mda or MDA depending on your model export name
        const mdaCount = await Mda.count();
        const adminCount = await User.count({ where: { role: 'NPA_ADMIN' } });

        // Strategic Plan Stats
        const planStats = {
            draft: await StrategicPlan.count({ where: { status: 'Draft' } }),
            submitted: await StrategicPlan.count({ where: { status: 'Submitted' } }),
            approved: await StrategicPlan.count({ where: { status: 'Approved' } }),
            revision: await StrategicPlan.count({ where: { status: 'Revision Required' } })
        };

        // MdaReport Stats (Aligned with your new Model)
        const reportStats = {
            draft: await MdaReport.count({ where: { status: 'Draft' } }),
            submitted: await MdaReport.count({ where: { status: 'Submitted' } }),
            approved: await MdaReport.count({ where: { status: 'Approved' } }),
            revision: await MdaReport.count({ where: { status: 'Needs Revision' } }) // Matches your ENUM
        };

        res.render('npa/dashboard', {
            stats: {
                mdas: mdaCount,
                admins: adminCount,
                plans: planStats,
                reports: reportStats,
                // Total items sitting in the NPA's "To-Do" list
                totalInbox: planStats.submitted + reportStats.submitted 
            },
            activePage: 'dashboard'
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).send("Unable to load dashboard statistics.");
    }
};



