const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
router.get('/', (req, res) => {
    res.redirect('/login');
});
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

// Add this to your auth routes file
router.get('/logout', (req, res) => {
    // 1. Clear the session or JWT cookie
    res.clearCookie('token'); // Replace 'token' with your actual cookie name
    
    // 2. Redirect the user to the login page
    res.redirect('/login');
});

module.exports = router;