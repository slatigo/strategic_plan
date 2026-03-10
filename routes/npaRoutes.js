const express = require('express');
const router = express.Router();

// 1. Import Controllers
const npaController = require('../controllers/npa/npaController');
const mdaController = require('../controllers/npa/mdaController');
const adminController = require('../controllers/npa/adminController');
const planCallController = require('../controllers/npa/planCallController');
// 2. Import Middleware
const { protect, restrictTo } = require('../middleware/authMiddleware');

// 3. Apply Global Security (All routes below this line require npa_admin)
router.use(protect);
router.use(restrictTo('npa_admin'));

// --- ROUTES ---

// Dashboard (Handled by npaController)
router.get('/dashboard', npaController.getDashboard);
router.post('/api/mda', protect, mdaController.createMDA);
router.route('/api/mda/:id')
    .put(protect, mdaController.updateMDA)
    .delete(protect, mdaController.deleteMDA);
// routes/npaRoutes.js
router.get('/mda/:id/admins', protect, mdaController.getMdaAdminsPage);
router.get('/mda', mdaController.listAll);


// Admin Management
router.get('/admins', protect, restrictTo('npa_admin'), adminController.getAdminsPage);
router.post('/api/admins', protect, restrictTo('npa_admin'), adminController.createAdmin);
router.delete('/admins/:id', adminController.deleteAdmin);
router.route('/api/admins/:id')
    .put(protect, restrictTo('npa_admin'), adminController.updateAdmin)
    .delete(protect, restrictTo('npa_admin'), adminController.deleteAdmin);



// Plan Calls Management
router.get('/plan-calls', planCallController.listPlanCalls);
router.post('/api/plan-calls', planCallController.createPlanCall);
router.put('/api/plan-calls/:id', planCallController.updatePlanCall);
router.patch('/api/plan-calls/:id/status', planCallController.toggleStatus);
router.delete('/api/plan-calls/:id', planCallController.deletePlanCall);

module.exports = router;