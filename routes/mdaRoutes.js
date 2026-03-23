const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/mda/plannerController');
const planController = require('../controllers/mda/planController');
const reportController = require('../controllers/mda/reportController');
const settings = require('../controllers/mda/mdaSettingsController');
const { protect, restrictTo } = require('../middleware/authMiddleWare.js');

/**
 * STRATEGIC PLAN MODERATOR ROUTES
 * Organized by Hierarchy: Plan > Objective > Outcome > Intermediate > Intervention > Output > Action
 */

// Global Security Middleware
router.use(protect);
router.use(restrictTo('mda_admin'));

// --- 1. CORE VIEW ROUTES ---
router.get('/plans',planController.getPlansLanding);
router.get('/dashboard', plannerController.getDashboard);
router.get('/plans/:id/edit', planController.getPlanEditor);
router.get('/plans/view/:id', planController.getPlanEditor); // <--- Add this
router.post('/plans/start', planController.startNewPlan);
router.post('/plans/:id/submit-npa', planController.submitPlanToNPA);
// --- 2. OBJECTIVE MANAGEMENT ---
router.post('/plans/objectives/add', planController.addObjective);
router.delete('/plans/objectives/:id', planController.removeObjective);

// --- 3. OUTCOME & OUTCOME INDICATORS ---
router.get('/api/library-outcomes', planController.getLibraryOutcomes);
router.post('/plans/outcomes/add', planController.addOutcome);
router.delete('/api/plan/outcome/:id', planController.deleteOutcome);

// Fetch Library Indicators by selected SP Outcome
router.get('/api/library-indicators-by-outcome/:spOutcomeId', planController.getLibraryIndicatorsBySpOutcome);
router.post('/plans/indicators/save', planController.saveOutcomeIndicator);

// --- 4. INTERMEDIATE OUTCOME & INDICATORS ---
router.get('/api/library/intermediate-outcomes/:spOutcomeId', planController.getLibraryIntermediates);
router.post('/api/plan/save-intermediate', planController.addIntermediateOutcome);
router.delete('/api/plan/intermediate/:id', planController.deleteIntermediate);

// Fetch Library Indicators by selected SP Intermediate Outcome
router.get('/api/library/intermediate-indicators/:spIntermediateOutcomeId', planController.getLibraryIntIndicators);
router.post('/api/plan/save-int-indicator', planController.saveIntermediateOutcomeIndicator);

// --- 5. INTERVENTION MANAGEMENT ---
router.get('/api/library/interventions/:spIntermediateOutcomeId', planController.getLibraryInterventions);
router.post('/api/plan/save-intervention', planController.saveIntervention);
router.delete('/api/plan/intervention/:id', planController.deleteIntervention);

// --- 6. OUTPUT & OUTPUT INDICATORS ---
router.get('/api/library/outputs-by-intervention/:spInterventionId', planController.getLibraryOutputsByIntervention);
router.post('/api/plan/save-output', planController.saveOutput);
router.delete('/api/plan/delete-output/:id', planController.deleteOutput);

// FIXED: Added missing route for Output Indicator Library fetching
router.get('/api/library/output-indicators/:spOutputId', planController.getLibraryOutputIndicators);
router.post('/api/plan/save-output-indicator', planController.saveOutputIndicator);

// --- 7. ACTIONS & BUDGETS ---
router.get('/api/library/actions-by-output/:spOutputId', planController.getLibraryActionsByOutput);
router.post('/api/plan/save-output-action', planController.saveOutputAction);
router.delete('/api/plan/delete-output-action/:id', planController.deleteOutputAction);

// --- 8. UNIFIED INDICATOR UTILITIES (DETAILS & DELETION) ---
// Used for the "Edit" fetch and "Delete" actions across all levels
router.get('/api/plan/indicator-details/:level/:id', planController.getIndicatorDetails);
router.delete('/api/plan/remove-indicator/:level/:id', planController.deleteIndicator);

// All settings routes grouped
router.get('/settings', settings.getSettingsOverview);

router.post('/settings/offices/save', settings.saveOffice);
router.delete('/settings/offices/:id', settings.deleteOffice);

router.post('/settings/budget-sources/save', settings.saveBudgetSource);
router.delete('/settings/budget-sources/:id', settings.deleteBudgetSource);

router.get('/reports', reportController.getReportsLanding);
router.get('/reports/start/:callId', reportController.startReport);
router.get('/reports/edit/:id', reportController.getReportEditor); // We'll build this next
router.post('/reports/save-progress', reportController.saveReportProgress);
router.post('/reports/final-submit', reportController.submitFinalReport);
router.get('/reports/view/:id', reportController.getReportEditor);
module.exports = router;