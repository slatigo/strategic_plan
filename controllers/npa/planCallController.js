const { PlanCall } = require('../../models');
const AppError = require('../../utils/appError');

exports.listPlanCalls = async (req, res, next) => {
    try {
        const calls = await PlanCall.findAll({ 
            order: [['created_at', 'DESC']] 
        });
        
        res.render('npa/plan-calls', {
            title: 'Strategic Plan Calls',
            activePage: 'plan-calls',
            calls,
            user: req.user
        });
    } catch (error) {
        next(error); // Passes to your Global Error Handler in app.js
    }
};

exports.createPlanCall = async (req, res, next) => {
    try {
        let { fy, description, deadline } = req.body;

        // 1. Extract the start year and trim any whitespace
        // " 2025/2030 " -> "2025"
        const startYearStr = (fy.includes('/') ? fy.split('/')[0] : fy).trim();

        // 2. Validate it's actually a 4-digit number
        if (!/^\d{4}$/.test(startYearStr)) {
            return next(new AppError('Please provide a valid 4-digit starting year (e.g., 2025).', 400));
        }

        // 3. Check existence using the string (matches your VARCHAR schema)
        const existing = await PlanCall.findOne({ where: { fy: startYearStr } });
        if (existing) {
            // We use Number() here just for the error message display math
            const endYear = Number(startYearStr) + 5;
            return next(new AppError(`A Strategic Plan for ${startYearStr}/${endYear} already exists.`, 400));
        }

        // 4. Create the record
        const newCall = await PlanCall.create({ 
            fy: startYearStr, // Saves "2025" into your VARCHAR column
            description, 
            deadline 
        });

        res.status(201).json({ 
            status: 'success', 
            message: 'Strategic Plan Call issued successfully!',
            data: newCall 
        });
    } catch (error) {
        next(error);
    }
};

exports.updatePlanCall = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { description, deadline } = req.body;

        const [updatedRows] = await PlanCall.update(
            { description, deadline }, 
            { where: { id } }
        );

        if (updatedRows === 0) {
            return next(new AppError('No plan call found with that ID', 404));
        }

        res.json({ status: 'success', message: 'Call updated successfully' });
    } catch (error) {
        next(error);
    }
};

exports.toggleStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await PlanCall.update({ status }, { where: { id } });
        res.json({ status: 'success', message: `Call is now ${status}` });
    } catch (error) {
        next(new AppError('Failed to update status.', 500));
    }
};

exports.deletePlanCall = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Note: You could add a check here to see if any Indicators are linked
        // before allowing a delete.

        const deleted = await PlanCall.destroy({ where: { id } });
        
        if (!deleted) {
            return next(new AppError('No plan call found with that ID', 404));
        }

        res.json({ status: 'success', message: 'Plan Call deleted successfully.' });
    } catch (error) {
        next(error);
    }
};