const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/mda/plannerController');

// Import the updated middleware functions
const { protect, restrictTo } = require('../middleware/authMiddleWare.js');

/** * AUTHENTICATION & AUTHORIZATION 
 * 1. protect: Verifies the JWT npa_token
 * 2. restrictTo: Ensures only 'MDA Admin' roles pass through
 */
router.use(protect);
router.use(restrictTo('mda_admin'));

// --- VIEW ROUTES ---

// Main Dashboard for the Planner (Shows Active Plans & Open Calls)
router.get('/dashboard', plannerController.getDashboard);
// --- API ROUTES ---

// Start a new Strategic Plan (Creates the header record for a Call)
router.post('/api/plans/start', plannerController.startNewPlan);

// Logic to handle the "Back and Forth" re-submission
//router.post('/api/plans/:id/submit', plannerController.submitPlan);

module.exports = router;