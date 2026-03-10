const { User } = require('../../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

//ADMIN PAGE
// controllers/adminController.js

exports.getAdminsPage = async (req, res) => {
    try {
        const admins = await User.findAll({ where: { role: 'npa_admin' } });
        
        res.render('npa/admins', {
            title: 'Admins Management',
            activePage: 'admins',
            admins: admins,
            // THIS LINE IS MISSING:
            user: req.user 
        });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
};
/**
 * CREATE SYSTEM ADMIN
 * POST /npa/api/admins
 */
exports.createAdmin = async (req, res) => {
    try {
        // 1. Destructure mda_id and role from the body
        const { name, email, password, mda_id, role } = req.body;

        // 2. Basic Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide name, email, and password.'
            });
        }

        // 3. Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                status: 'fail',
                message: 'This email is already registered.'
            });
        }

        /**
         * NOTE: REMOVED manual bcrypt.hash here. 
         * Your User model's 'beforeCreate' hook handles hashing automatically.
         * Double hashing will prevent successful logins.
         */

        // 4. Create the User
        const newAdmin = await User.create({
            name,
            email,
            password, // Send plain text; the model hook hashes it
            // Use role from body or default to npa_admin if mda_id is null
            role: role || (mda_id ? 'mda_admin' : 'npa_admin'),
            mda_id: mda_id || null, 
            active: true
        });

        res.status(201).json({
            status: 'success',
            message: mda_id 
                ? 'MDA Administrator added successfully!' 
                : 'System Administrator invited successfully!'
        });

    } catch (error) {
        console.error('Create Admin Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while creating admin.'
        });
    }
};

/**
 * UPDATE SYSTEM ADMIN
 * PUT /npa/api/admins/:id
 */
exports.updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        // 1. Destructure 'active' from the body
        const { name, email, active } = req.body;

        const admin = await User.findByPk(id);

        if (!admin) {
            return res.status(404).json({
                status: 'fail',
                message: 'Administrator not found.'
            });
        }

        // 2. Prevent changing email to one that belongs to someone else
        const emailCheck = await User.findOne({
            where: {
                email,
                id: { [Op.ne]: id }
            }
        });

        if (emailCheck) {
            return res.status(400).json({
                status: 'fail',
                message: 'This email is already in use by another user.'
            });
        }

        // 3. Update with the 'active' status
        // We handle potential variations (true/false, "true"/"false", or "on")
        await admin.update({ 
            name, 
            email, 
            active: active === true || active === 'true' || active === 'on' 
        });

        res.status(200).json({
            status: 'success',
            message: 'Administrator updated successfully.'
        });

    } catch (error) {
        console.error('Update Admin Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while updating admin.'
        });
    }
};

/**
 * DELETE SYSTEM ADMIN
 * DELETE /npa/api/admins/:id
 */
exports.deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // SAFETY: Prevent an admin from deleting themselves
        if (id == req.user.id) {
            return res.status(400).json({
                status: 'fail',
                message: 'You cannot delete your own account.'
            });
        }

        const admin = await User.findByPk(id);

        if (!admin) {
            return res.status(404).json({
                status: 'fail',
                message: 'Administrator not found.'
            });
        }

        await admin.destroy();

        res.status(200).json({
            status: 'success',
            message: 'Administrator removed successfully.'
        });

    } catch (error) {
        console.error('Delete Admin Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while deleting admin.'
        });
    }
};