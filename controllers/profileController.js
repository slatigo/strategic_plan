const bcrypt = require('bcryptjs');
const db = require('../models'); 
const User = db.User;

exports.renderChangePassword = (req, res) => {
    // Safety check: ensure req.user exists
    if (!req.user) return res.redirect('/login');

    // Determine which proxy view to render
    const viewPath = req.user.role === 'npa_admin' 
        ? 'npa/change-password' 
        : 'mda/change-password';
    
    res.render(viewPath, {
        title: 'Change Password',
        activePage: 'profile'
    });
};

exports.processChangePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    try {
        // 1. Basic validation
        if (newPassword !== confirmPassword) {
            req.flash('error', 'New passwords do not match.');
            return res.redirect('/profile/change-password');
        }

        // 2. Fetch authenticated user
        if (!req.user || !req.user.id) {
            return res.redirect('/login');
        }

        const user = await User.findByPk(req.user.id);
        
        if (!user) {
            req.flash('error', 'User account not found.');
            return res.redirect('/login');
        }

        // 3. Verify current password
        // We compare the plain text input with the hashed password in the DB
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            req.flash('error', 'Incorrect current password.');
            return res.redirect('/profile/change-password');
        }

        // 4. Update password
        // DO NOT hash here. Assign the plain text password to the user model.
        // Sequelize's 'beforeUpdate' hook in your User model will handle the hashing.
        user.password = newPassword; 
        await user.save();

        req.flash('success', 'Password updated successfully.');
        res.redirect('/profile/change-password');

    } catch (error) {
        console.error('Password change error:', error);
        req.flash('error', 'An error occurred. Please try again.');
        res.redirect('/profile/change-password');
    }
};