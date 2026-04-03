'use strict';

const express = require('express');
const router = express.Router();

// 1. Import Controllers
const npaController = require('../controllers/npa/npaController');
const mdaController = require('../controllers/npa/mdaController');
const adminController = require('../controllers/npa/adminController');
const planCallController = require('../controllers/npa/planCallController');
const reportCallController = require('../controllers/npa/reportCallController');

// 2. Import Middleware
const { protect, restrictTo } = require('../middleware/authMiddleWare');

// 3. Apply Global Security
// All routes in this file require being logged in as an NPA Admin
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

// --- 5-YEAR STRATEGIC PLAN CALLS ---
router.get('/plan-calls', planCallController.listPlanCalls);
// A. The Monitoring Dashboard (List of all MDAs for a specific Fiscal Year Call)
// This is the equivalent of your '/report-calls/:id/submissions' but for Plans
router.get('/plan-calls/:id/submissions', planCallController.viewPlanSubmissions);

// B. The Review Page (The deep dive into a specific MDA's 5-year plan)
router.get('/plans/:planId/review', planCallController.reviewPlanSubmission);

// C. Decision Operations (Approve, Reject, or Send back for Correction)
// Using POST/PATCH for status changes and remarks
router.post('/plans/:planId/review', planCallController.submitPlanDecision);
router.post('/api/plan-calls', planCallController.createPlanCall);
router.put('/api/plan-calls/:id', planCallController.updatePlanCall);
router.patch('/api/plan-calls/:id/status', planCallController.toggleStatus);
router.delete('/api/plan-calls/:id', planCallController.deletePlanCall);

// --- QUARTERLY REPORT CALLS (Snapshots) ---

// A. Snapshot Window Management
router.get('/report-calls', reportCallController.listReportCalls);
router.post('/api/report-calls', reportCallController.createReportCall);
router.put('/api/report-calls/:id', reportCallController.updateReportCall);
router.delete('/api/report-calls/:id', reportCallController.deleteReportCall);

// B. Status & Lifecycle Operations
router.patch('/api/report-calls/:id/status', reportCallController.updateStatus);
router.patch('/api/report-calls/:id/publish', reportCallController.publishReportCall);
router.patch('/api/report-calls/:id/close', reportCallController.closeReportCall);
router.patch('/api/report-calls/:id/reopen', reportCallController.reopenReportCall);

// C. MONITORING & COMPLIANCE (The Entry Points)
router.get('/report-calls/:id/submissions', reportCallController.viewReportSubmissions);
// A. THE NATIONAL DASHBOARD (Aggregated view of all MDAs)
// Example: /npa/report-calls/5/analysis
router.get('/report-calls/:id/analysis', reportCallController.getNationalAnalysis);

router.get('/reports/:reportId/review', reportCallController.reviewMdaReport);
router.patch('/api/reports/:reportId/status', reportCallController.updateReportStatus);

module.exports = router;