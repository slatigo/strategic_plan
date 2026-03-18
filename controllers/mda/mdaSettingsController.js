const { Office, BudgetSource } = require('../../models');

// 1. Unified View (optional: separate tabs in one page, or just separate routes)
exports.getSettingsOverview = async (req, res) => {
    try {
        const offices = await Office.findAll({ where: { mdaId: req.user.mdaId }, order: [['name', 'ASC']] });
        const budgetSources = await BudgetSource.findAll({ where: { mdaId: req.user.mdaId }, order: [['name', 'ASC']] });
        
        res.render('mda/settings/index', {
            title: 'MDA Configuration',
            offices,
            budgetSources,
            activePage: 'settings'
        });
    } catch (error) {
        res.status(500).send("Error loading settings");
    }
};

// 2. Office Actions
exports.saveOffice = async (req, res) => {
    const { id, name, code } = req.body;
    const data = { name, code, mdaId: req.user.mdaId };
    id ? await Office.update(data, { where: { id, mdaId: req.user.mdaId } }) 
       : await Office.create(data);
    res.redirect('back'); // Redirects to the page the user was on
};

exports.deleteOffice = async (req, res) => {
    await Office.destroy({ where: { id: req.params.id, mdaId: req.user.mdaId } });
    res.json({ success: true });
};

// 3. Budget Source Actions
exports.saveBudgetSource = async (req, res) => {
    const { id, name, code } = req.body;
    const data = { name, code, mdaId: req.user.mdaId };
    id ? await BudgetSource.update(data, { where: { id, mdaId: req.user.mdaId } }) 
       : await BudgetSource.create(data);
    res.redirect('back');
};

exports.deleteBudgetSource = async (req, res) => {
    await BudgetSource.destroy({ where: { id: req.params.id, mdaId: req.user.mdaId } });
    res.json({ success: true });
};