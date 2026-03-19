const express = require('express');
const router = express.Router();

// 1. Import Controllers
const npaController = require('../controllers/npa/npaController');
const mdaController = require('../controllers/npa/mdaController');
const adminController = require('../controllers/npa/adminController');
const planCallController = require('../controllers/npa/planCallController');
const reportCallController = require('../controllers/npa/reportCallController');

// 2. Import Middleware
const { protect, restrictTo } = require('../middleware/authMiddleware');

// 3. Apply Global Security
router.use(protect);
router.use(restrictTo('npa_admin'));

// --- DASHBOARD & MDA MANAGEMENT ---
router.get('/dashboard', npaController.getDashboard);
router.get('/mda', mdaController.listAll);
router.get('/mda/:id/admins', mdaController.getMdaAdminsPage);

router.post('/api/mda', mdaController.createMDA);
router.put('/api/mda/:id', mdaController.updateMDA);
router.delete('/api/mda/:id', mdaController.deleteMDA);

// --- ADMIN MANAGEMENT ---
router.get('/admins', adminController.getAdminsPage);
router.post('/api/admins', adminController.createAdmin);
router.put('/api/admins/:id', adminController.updateAdmin);
router.delete('/api/admins/:id', adminController.deleteAdmin);

// --- 5-YEAR PLAN CALLS MANAGEMENT ---
router.get('/plan-calls', planCallController.listPlanCalls);
router.post('/api/plan-calls', planCallController.createPlanCall);
router.put('/api/plan-calls/:id', planCallController.updatePlanCall);
router.patch('/api/plan-calls/:id/status', planCallController.toggleStatus);
router.delete('/api/plan-calls/:id', planCallController.deletePlanCall);

// --- QUARTERLY REPORT CALLS (Snapshots) ---
// View & Create
router.get('/report-calls', reportCallController.listReportCalls);
router.post('/api/report-calls', reportCallController.createReportCall);

// Individual Snapshot Operations (Update & Delete)
// Using explicit paths here fixes the 404 matching issues
router.put('/api/report-calls/:id', reportCallController.updateReportCall);
router.delete('/api/report-calls/:id', reportCallController.deleteReportCall);

// Snapshot Status Logic
// Order matters: specific sub-paths like /status or /publish must work alongside the /:id base
router.patch('/api/report-calls/:id/status', reportCallController.updateStatus);
router.patch('/api/report-calls/:id/publish', reportCallController.publishReportCall);
router.patch('/api/report-calls/:id/close', reportCallController.closeReportCall);
router.patch('/api/report-calls/:id/reopen', reportCallController.reopenReportCall);

module.exports = router;