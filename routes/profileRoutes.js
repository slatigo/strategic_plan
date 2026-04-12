const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Fix: Destructure 'protect' instead of 'isAuthenticated'
const { protect } = require('../middleware/authMiddleWare'); 

// Apply the 'protect' middleware here
router.get('/change-password', protect, profileController.renderChangePassword);
router.post('/change-password', protect, profileController.processChangePassword);

module.exports = router;