const { Mda,User } = require('../../models');
const { Op } = require('sequelize');
exports.listAll = async (req, res) => {
    try {
        // Fetch all MDAs with their associated Admins included
        const mdas = await Mda.findAll({ 
            include: [{
                model: User,
                as: 'admins', // Must match the alias in Mda.associate
                attributes: ['id'] // We only need the ID to count them, keeps query fast
            }],
            order: [['name', 'ASC']] 
        });
        
        res.render('npa/mdas', {
            title: 'Manage MDAs',
            activePage: 'mdas',
            mdas: mdas,
            user: req.user 
        });

    } catch (error) {
        console.error("Error fetching MDAs:", error);
        res.status(500).render('error', { 
            message: "Could not load MDAs. Please check the database connection." 
        });
    }
};

exports.createMDA = async (req, res) => {
    try {
        const { name, code, type } = req.body;

        // 1. Basic validation
        if (!name || !code || !type) {
            return res.status(400).json({ 
               status: 'error', 
                message: "All fields (Name, Code, and Type) are required." 
            });
        }

        // 2. Check if the code already exists (e.g., 'MOH' shouldn't be duplicated)
        const existingMda = await Mda.findOne({ where: { code: code.toUpperCase() } });
        if (existingMda) {
            return res.status(400).json({ 
               status: 'error', 
                message: `An MDA with the code '${code}' already exists.` 
            });
        }

        // 3. Create the record
        await Mda.create({
            name,
            code: code.toUpperCase(), // Standardize to uppercase
            type
        });

        // 4. Respond
        res.status(201).json({ 
           status: 'success', 
            message: "MDA created successfully!" 
        });

    } catch (error) {
        console.error("Create MDA Error:", error);
        res.status(500).json({ 
           status: 'error', 
            message: "Internal server error while creating MDA." 
        });
    }
};


exports.updateMDA = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, type } = req.body;

        // 1. Find the MDA
        const mda = await Mda.findByPk(id);
        if (!mda) {
            return res.status(404).json({ 
                status: 'fail', // Match frontend expectation
                message: "MDA not found in the database." 
            });
        }

        // 2. Check for duplicate code (excluding current MDA)
        const duplicateCode = await Mda.findOne({ 
            where: { 
                code: code.toUpperCase(),
                id: { [Op.ne]: id } 
            } 
        });

        if (duplicateCode) {
            return res.status(400).json({ 
                status: 'fail', 
                message: `The code '${code}' is already assigned to ${duplicateCode.name}.` 
            });
        }

        // 3. Perform the update
        await mda.update({
            name,
            code: code.toUpperCase(),
            type
        });

        res.json({ 
            status: 'success', 
            message: "MDA updated successfully!" 
        });

    } catch (error) {
        console.error("Update MDA Error:", error);
        res.status(500).json({ 
            status: 'error', 
            message: "Server error while updating MDA." 
        });
    }
};

exports.deleteMDA = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Find the MDA first
        const mda = await Mda.findByPk(id);

        if (!mda) {
            return res.status(404).json({
                status: 'fail',
                message: "This MDA no longer exists or has already been deleted."
            });
        }

        // 2. Perform the deletion
        // Note: If you have foreign key constraints (like users in this MDA), 
        // this will throw an error unless you've set 'ON DELETE CASCADE' in your migrations.
        await mda.destroy();

        res.status(200).json({
            status: 'success',
            message: "MDA and associated records removed successfully."
        });

    } catch (error) {
        console.error("Delete MDA Error:", error);
        
        // Handle Foreign Key Constraint Errors specifically
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({
                status: 'fail',
                message: "Cannot delete this MDA because it has active users or reports attached to it."
            });
        }

        res.status(500).json({
            status: 'error',
            message: "An internal error occurred while trying to delete the MDA."
        });
    }
};


exports.getMdaAdminsPage = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Fetch the MDA and its associated Admins
        const mda = await Mda.findByPk(id, {
            include: [{
                model: User,
                as: 'admins', // Matches the alias in your model association
                where: { role: 'mda_admin' },
                required: false // Show the MDA even if it has 0 admins
            }]
        });


        if (!mda) return res.status(404).send('MDA not found');

        res.render('npa/mda-admins', {
            title: `${mda.name} - Administrators`,
            activePage: 'mdas',
            mda: mda,
            user: req.user,
            admins: mda.admins || []
        });
    } catch (error) {
        console.log(error)
        res.status(500).send('Error loading MDA admins');
    }
};


