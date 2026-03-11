const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/mda/plannerController');
const planController = require('../controllers/mda/planController');
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

// 1. Render the main editor page
router.get('/plans/:id/edit', planController.getPlanEditor);

// 2. API: Add an objective to the plan (Called by your plan-editor.js)
router.post('/plans/objectives/add', planController.addObjective);

// 3. API: Remove an objective (Useful for the 'Delete' button in your table)
router.delete('/plans/objectives/:id', planController.removeObjective);

/** 2. API: Get Library Outcomes
 * Used by the modal to fetch outcomes for a specific objective
 * URL: /mda/api/library-outcomes?objectiveId=X&spObjectiveId=Y
 */
router.get('/api/library-outcomes', planController.getLibraryOutcomes);

 //* 3. POST: Add Outcome
router.post('/plans/outcomes/add', planController.addOutcome);
// Get indicators for the dropdown based on the selected Outcome
router.get('/api/library-indicators-by-outcome/:spOutcomeId', planController.getLibraryIndicatorsBySpOutcome);

// Save the Indicator and its 5-year targets
router.post('/plans/indicators/save', planController.saveOutcomeIndicator);

//router.post('/plans/interventions/add', planController.addIntervention);
//router.post('/plans/outputs/add', planController.addOutput);
module.exports = router;

// Logic to handle the "Back and Forth" re-submission
//router.post('/api/plans/:id/submit', plannerController.submitPlan);

module.exports = router;