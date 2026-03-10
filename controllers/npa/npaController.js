const { Mda, User } = require('../../models');

exports.getDashboard = async (req, res) => {
    try {
        const mdaCount = await Mda.count();
        // Add more counts here as you build models (PlanCalls, etc.)
       
        
        res.render('npa/dashboard', { 
            user: req.user,
            title: 'Dashboard Overview',
            activePage: 'dashboard',
            stats: {
                mdas: mdaCount,
                pending: 0,
                admins: 1 
            }
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).render('error', { message: "Failed to load dashboard." });
    }
};