const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 1. PAGE RENDERING
// Access via: http://localhost:3002/login
router.get('/login', (req, res) => {
    res.render('login'); 
});

// 2. API ENDPOINTS 
// Access via: http://localhost:3002/api/login
router.post('/api/login', authController.login);

// Access via: http://localhost:3002/api/logout
router.post('/api/logout', (req, res) => {
    res.status(200).json({ success: true, message: "Logged out" });
});

module.exports = router;