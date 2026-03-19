const { ReportCall, PlanCall, sequelize } = require('../../models');
const AppError = require('../../utils/appError');

/**
 * List all report calls with their parent Plan Call info
 */
exports.listReportCalls = async (req, res, next) => {
  try {
    const reportCalls = await ReportCall.findAll({
      include: [{
        model: PlanCall,
        as: 'MasterPlan',
        // REMOVE fYearStart and fYearEnd from here:
        attributes: ['fy'] 
      }],
      order: [['created_at', 'DESC']]
    });

    // Also: Check if your PlanCall status is 'Open' or 'Active' 
    // We used 'Open' in the Model ENUM earlier.
    const planCalls = await PlanCall.findAll({ where: { status: 'Open' } });

    res.render('npa/report-calls', {
      title: 'Quarterly Report Snapshots',
      activePage: 'report-calls',
      reportCalls,
      planCalls, 
      user: req.user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new Snapshot Window
 */
// controllers/npa/reportCallController.js

exports.createReportCall = async (req, res, next) => {
  try {
    let { planCallId, reportingYear, quarter, deadline, description } = req.body;

    // 1. Find the Master Plan to get its start year
    const masterPlan = await PlanCall.findByPk(planCallId);
    if (!masterPlan) {
      return next(new AppError('The selected Strategic Plan does not exist.', 404));
    }

    // 2. Clean the input (e.g., "2031/2032" -> 2031)
    const selectedYear = parseInt(reportingYear.includes('/') ? reportingYear.split('/')[0] : reportingYear);
    const planStartYear = parseInt(masterPlan.fy);
    const planEndYear = planStartYear + 4; // 2025 to 2029 (5 years)

    // 3. THE GUARDRAIL: Check if selected year is within [Start, Start + 4]
    if (selectedYear < planStartYear || selectedYear > planEndYear) {
      return next(new AppError(
        `Validation Error: FY ${selectedYear} falls outside the ${planStartYear}/${planStartYear + 5} Strategic Plan cycle.`, 
        400
      ));
    }

    // 4. Save only if valid
    const newReportCall = await ReportCall.create({
      planCallId,
      reportingYear: selectedYear.toString(), // Keep as string for your VARCHAR(255)
      quarter,
      deadline,
      description,
      status: 'Draft'
    });

    res.status(201).json({ status: 'success', data: newReportCall });
  } catch (err) {
    next(err);
  }
};

/**
 * Update Snapshot Details
 */
exports.updateReportCall = async (req, res, next) => {
  try {
    const call = await ReportCall.findByPk(req.params.id);
    if (!call) return next(new AppError('No snapshot found with that ID', 404));

    await call.update(req.body);

    res.status(200).json({ status: 'success', data: call });
  } catch (err) {
    next(err);
  }
};

/**
 * Publish the Snapshot (Open for MDAs)
 */
exports.publishReportCall = async (req, res, next) => {
  try {
    const call = await ReportCall.findByPk(req.params.id);
    if (!call) return next(new AppError('No snapshot found', 404));

    // Update status to Open
    await call.update({ status: 'Open' });

    // Note: Here you would typically trigger an email notification to MDAs
    
    res.status(200).json({
      status: 'success',
      message: `Snapshot for ${call.quarter} ${call.reportingYear} is now Open for reporting.`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Close the Snapshot (Deadline reached)
 */
exports.closeReportCall = async (req, res, next) => {
  try {
    await ReportCall.update(
      { status: 'Closed' },
      { where: { id: req.params.id } }
    );

    res.status(200).json({ status: 'success', message: 'Reporting window closed.' });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a Snapshot (Only if no data has been reported yet)
 */
// Ensure 'MdaReport' (or whatever your submission model is called) is imported at the top
// const { ReportCall, MdaReport, sequelize } = require('../../models');

exports.deleteReportCall = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Import the new parent model
    const { MdaReport } = sequelize.models;

    // 2. Check if any MDA has initiated a report for this call
    const reportCount = await MdaReport.count({ where: { reportCallId: id } });

    if (reportCount > 0) {
      return next(new AppError(
        `Cannot delete. ${reportCount} MDAs have already started reporting in this window.`, 
        400
      ));
    }

    // 3. Clean to delete
    await ReportCall.destroy({ where: { id } });

    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};

/**
 * Re-open a Closed Snapshot
 */
exports.reopenReportCall = async (req, res, next) => {
  try {
    const call = await ReportCall.findByPk(req.params.id);
    
    if (!call) {
      return next(new AppError('Reporting window not found.', 404));
    }

    // Update status back to 'Open'
    await call.update({ status: 'Open' });

    res.status(200).json({ 
      status: 'success', 
      message: 'Reporting window has been re-opened.' 
    });
  } catch (err) {
    next(err);
  }
};


// Add this to reportCallController.js
exports.updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Draft', 'Open', or 'Closed'
        const validStatuses = ['Draft', 'Open', 'Closed'];
          if (!validStatuses.includes(status)) {
              return next(new AppError(`Invalid status: ${status}. Must be Draft, Open, or Closed.`, 400));
}
        await ReportCall.update({ status }, { where: { id } });

        res.status(200).json({ 
            status: 'success', 
            message: `Snapshot status updated to ${status}` 
        });
    } catch (err) {
        next(err);
    }
};