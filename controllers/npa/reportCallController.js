const { 
  User, Mda, ReportCall, PlanCall, MdaReport, ReportComment, 
  StrategicPlan, SpObjective, SpOutcome, SpIntermediateOutcome, 
  SpOutput, SpOutcomeIndicator, SpIntermediateOutcomeIndicator, 
  SpOutputIndicator, SpOutcomeIndicatorReport, 
  SpIntermediateOutcomeIndicatorReport, SpOutputIndicatorReport, 
  Objective, Outcome, OutcomeIndicator, NationalAlignment,IntermediateOutcomeIndicator,OutputIndicator,
  Sequelize, sequelize 
} = require('../../models');

// Extract the operators and functions from the Sequelize constructor
const { Op, fn, col } = Sequelize;
const AppError = require('../../utils/appError');

exports.listReportCalls = async (req, res, next) => {
  try {
   
    const totalMdas = await Mda.count();
    
    const reportCalls = await ReportCall.findAll({
      attributes: {
        include: [
          // Counts from the mda_reports table
          [Sequelize.literal(`(
            SELECT COUNT(*) 
            FROM mda_reports 
            WHERE mda_reports.report_call_id = ReportCall.id 
            AND mda_reports.status = 'Submitted'
          )`), 'countSubmitted'],
          [Sequelize.literal(`(
            SELECT COUNT(*) 
            FROM mda_reports 
            WHERE mda_reports.report_call_id = ReportCall.id 
            AND mda_reports.status = 'Approved'
          )`), 'countApproved'],
          [Sequelize.literal(`(
            SELECT COUNT(*) 
            FROM mda_reports 
            WHERE mda_reports.report_call_id = ReportCall.id 
            AND mda_reports.status = 'Needs Revision'
          )`), 'countRevision']
        ]
      },
      include: [{
        model: PlanCall,
        as: 'MasterPlan',
        attributes: ['fy'] 
      }],
      order: [['created_at', 'DESC']]
    });

    const activePlanCalls = await PlanCall.findAll({ where: { status: 'Open' } });

    res.render('npa/report-calls', {
      title: 'Quarterly Report Snapshots',
      activePage: 'report-calls',
      reportCalls,
      planCalls: activePlanCalls, 
      totalMdas,
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

exports.viewReportSubmissions = async (req, res, next) => {
    try {
        const { id } = req.params;
        const targetCallId = parseInt(id, 10);

        // 1. Fetch the Call/Snapshot Info
        const snapshot = await ReportCall.findByPk(targetCallId, {
            include: [{ model: PlanCall, as: 'MasterPlan' }]
        });
        if (!snapshot) return res.status(404).send('Reporting Call not found');

        // 2. Setup Pagination & Search Params
        const page = parseInt(req.query.page, 10) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const statusFilter = req.query.status || '';

        // 3. Fetch ALL Reports for this specific Call ID first
        // We do this separately to avoid Sequelize Join nesting issues
        const allReports = await MdaReport.findAll({
            where: { reportCallId: targetCallId },
            include: [{ model: User, as: 'Reporter', attributes: ['name'] }],
            raw: true,
            nest: true
        });

        // 4. Create a Quick-Lookup Map (Key = mdaId, Value = Report Object)
        const reportMap = {};
        allReports.forEach(r => {
            reportMap[r.mdaId] = r;
        });

        // 5. Build MDA Query with Search
        let mdaWhere = {};
        if (search) {
            mdaWhere.name = { [Op.like]: `%${search}%` };
        }

        // 6. Fetch MDAs
        let { count, rows: mdaRows } = await Mda.findAndCountAll({
            where: mdaWhere,
            attributes: ['id', 'name', 'code'],
            order: [['name', 'ASC']],
            limit: limit,
            offset: offset,
            raw: true
        });

        // 7. Manually Attach Reports and Apply Status Filter
        let mdas = mdaRows.map(mda => {
            return {
                ...mda,
                report: reportMap[mda.id] || null
            };
        });

        // 8. If filtering by status, we must filter the array and update the count
        if (statusFilter) {
            mdas = mdas.filter(m => {
                const s = m.report ? m.report.status : 'Not Started';
                return s === statusFilter;
            });
            // Note: For true server-side pagination with a status filter on a joined table,
            // you'd usually need a complex literal query, but this works for most MDA lists.
            count = mdas.length; 
        }

        // 9. Render the View
        res.render('npa/report-submissions', {
            title: `Submissions: ${snapshot.quarter} ${snapshot.reportingYear}`,
            activePage: 'report-calls',
            snapshot,
            mdas,
            search,
            statusFilter,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            user: req.user
        });

    } catch (error) {
        console.error("CONTROLLER ERROR:", error);
        next(error);
    }
};


exports.updateReportStatus = async (req, res, next) => {
    // Start a transaction to ensure both DB operations succeed or fail together
    const t = await sequelize.transaction();

    try {
        const { reportId } = req.params;
        let { status, remarks } = req.body;

        // 1. Validation: Ensure status is provided
        if (!status) {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'Status is required for a review decision.' 
            });
        }

        // 2. Map UI status to your DB ENUM ('Draft','Submitted','Approved','Needs Revision')
        // This prevents the "Data Truncated" error we saw earlier
        const statusMap = {
            'Revision Required': 'Needs Revision',
            'Returned': 'Needs Revision',
            'Needs Revision': 'Needs Revision',
            'Approved': 'Approved'
        };

        const dbStatus = statusMap[status] || status;

        // 3. Find the report
        const report = await MdaReport.findByPk(reportId);
        if (!report) {
            await t.rollback();
            return res.status(404).json({ 
                status: 'fail', 
                message: 'Report not found' 
            });
        }

        // 4. Update Report Status
        await report.update({ 
            status: dbStatus,
            reviewedBy: req.user.id, 
            reviewedAt: new Date()
        }, { transaction: t });

        // 5. Create the dedicated Report Comment (THE TRAIL)
        // Note: Using the new ReportComment model we created in the migration
        await ReportComment.create({
            reportId: report.id,
            userId: req.user.id,
            message: remarks || `Report status updated to ${dbStatus}`,
            statusAtTime: dbStatus,
            isAdminComment: true 
        }, { transaction: t });

        // Commit changes
        await t.commit();

        res.status(200).json({
            status: 'success',
            message: `Report has been successfully marked as ${dbStatus}`,
            data: { reportStatus: dbStatus }
        });

    } catch (error) {
        await t.rollback();
        console.error("REPORT STATUS UPDATE ERROR:", error);
        res.status(500).json({ 
            status: 'error', 
            message: error.message || 'An error occurred while updating report status' 
        });
    }
};

const reportHelper = require('../../utils/reportFetcher');
// NPA Version (For Reviewing)
exports.reviewMdaReport = async (req, res) => {
    const data = await reportHelper.getFullReportPackage(req.params.reportId);
    
    if (!data) return res.status(404).send("Report not found");

    res.render('npa/reports/review', {
        ...data,
        currentFY: data.report.Call.reportingYear,
        isLocked: true, // NPA view is always read-only for data
        user: req.user
    });
};

exports.submitReportDecision = async (req, res) => {
    try {
        const { reportId } = req.params;
        let { status, remarks } = req.body;

        // Sync naming: UI 'Revision Required' maps to DB 'Pending Correction'
        if (status === 'Revision Required') status = 'Pending Correction';

        const report = await MdaReport.findByPk(reportId);
        if (!report) return res.status(404).json({ status: 'fail', message: 'Report not found' });

        // 1. Update the report status
        await report.update({ status });

        // 2. Create the comment linked to the report
        await PlanComment.create({
            reportId: report.id, // plan_id will be NULL automatically
            userId: req.user.id,
            message: remarks || `Report status changed to ${status}`,
            statusAtTime: status,
            isAdminComment: true
        });

        res.status(200).json({
            status: 'success',
            message: `Report has been marked as ${status}`
        });
    } catch (error) {
        console.error("REPORT DECISION ERROR:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.getNationalAnalysis = async (req, res) => {
    try {
        const { id } = req.params; // ReportCall ID

        // 1. Fetch Snapshot to get the correct Fiscal Year for Targets
        const snapshot = await ReportCall.findByPk(id, {
            include: [{ model: PlanCall, as: 'MasterPlan' }]
        });

        if (!snapshot) {
            return res.status(404).send("Performance snapshot not found.");
        }

        const currentFY = snapshot.reportingYear;

        // 2. Identify all Approved MDA Reports in this snapshot
        const mdaReports = await MdaReport.findAll({
            where: { reportCallId: id, status: 'Approved' },
            attributes: ['id']
        });

        const reportIds = mdaReports.map(r => r.id);

        // Handle empty state gracefully
        if (reportIds.length === 0) {
            return res.render('npa/reports/analysis', {
                snapshot,
                outcomes: [], intermediates: [], outputs: [],
                stats: { totalMdas: 0, overallAchievement: 0 }
            });
        }

        /**
         * INNER HELPER: aggregateLevel
         * Handles the complex 4-table join and SQL grouping
         */
        const aggregateLevel = async (ReportModel, SelectionModel, LibraryModel, libraryAlias, alignmentAlias) => {
            const reportIndicatorIdField = 
                ReportModel.name === 'SpOutcomeIndicatorReport' ? 'spOutcomeIndicatorId' : 
                ReportModel.name === 'SpIntermediateOutcomeIndicatorReport' ? 'spIntermediateOutcomeIndicatorId' : 
                'spOutputIndicatorId';

            const TargetModelName = `${SelectionModel.name}Target`;

            return await ReportModel.findAll({
                where: { mdaReportId: { [Op.in]: reportIds } },
                include: [{ 
                    model: SelectionModel, 
                    as: 'Indicator',
                    attributes: ['id'], 
                    include: [
                        { 
                            model: LibraryModel, 
                            as: libraryAlias,
                            attributes: ['id', 'indicator', 'indicatorCode'],
                            include: [{ 
                                model: NationalAlignment, 
                                as: alignmentAlias,
                                attributes: ['indicatorCode', 'polarity', 'unit_of_measure'] 
                            }] 
                        },
                        {
                            model: sequelize.models[TargetModelName], 
                            as: 'Targets',
                            where: { fy: currentFY }, 
                            attributes: ['val'],
                            required: false 
                        }
                    ]
                }],
                attributes: [
                    reportIndicatorIdField, 
                    [fn('AVG', col('actual_value')), 'avgActual'],
                    [fn('COUNT', col('mda_report_id')), 'mdaCount']
                ],
                group: [
                    reportIndicatorIdField, 
                    'Indicator.id', 
                    `Indicator->${libraryAlias}.id`, 
                    `Indicator->${libraryAlias}->${alignmentAlias}.indicator_code`,
                    `Indicator->Targets.id`,
                    `Indicator->Targets.val`
                ],
                raw: true, 
                nest: true
            });
        };

        // 3. Execute all aggregations in parallel for speed
        const [rawOutcomes, rawIntermediates, rawOutputs] = await Promise.all([
            aggregateLevel(SpOutcomeIndicatorReport, SpOutcomeIndicator, OutcomeIndicator, 'LibraryIndicator', 'OutcomeNational'),
            aggregateLevel(SpIntermediateOutcomeIndicatorReport, SpIntermediateOutcomeIndicator, IntermediateOutcomeIndicator, 'LibraryIndicator', 'IntermediateNational'),
            aggregateLevel(SpOutputIndicatorReport, SpOutputIndicator, OutputIndicator, 'LibraryIndicator', 'OutputNational')
        ]);



        /**
         * SCORING LOGIC
         */
        const calculateScore = (actual, target, polarity) => {
            if (!target || target <= 0) return 0;
            let score = (polarity === 'Decr') ? (target / actual) * 100 : (actual / target) * 100;
            return Math.min(Math.round(score), 150); // Cap at 150% to prevent outliers
        };

        const processResults = (data, alignAlias) => data.map(item => {
            const lib = item.Indicator.LibraryIndicator;
            const alignment = lib ? lib[alignAlias] : null;
            const polarity = alignment ? alignment.polarity : 'Incr';
            
            const targetVal = item.Indicator.Targets ? item.Indicator.Targets.val : 0;
            const target = parseFloat(targetVal) || 0;
            const actual = parseFloat(item.avgActual) || 0;

            return {
                ...item,
                target,
                actual,
                unit: alignment ? alignment.unit_of_measure : 'Units',
                polarity: polarity,
                achievement: calculateScore(actual, target, polarity),
                name: lib ? lib.indicator : 'Unnamed Indicator'
            };
        });

        // 4. Map the Raw SQL results to usable Performance Objects
        const outcomes = processResults(rawOutcomes, 'OutcomeNational');
        const intermediates = processResults(rawIntermediates, 'IntermediateNational');
        const outputs = processResults(rawOutputs, 'OutputNational');

        // Calculate Global Average for the Summary Cards
        const allScores = [...outcomes, ...intermediates, ...outputs].map(i => i.achievement);
        const globalAvg = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;

        // 5. Render the Analysis View
        res.render('npa/reports/analysis', {
            snapshot,
            outcomes,
            intermediates,
            outputs,
            stats: {
                totalMdas: mdaReports.length,
                overallAchievement: globalAvg,
                indicatorCount: allScores.length
            }
        });

    } catch (error) {
        console.error("CRITICAL ANALYSIS ERROR:", error);
        res.status(500).render('error', { 
            message: "Failed to generate National Analysis. Check database logs for grouping errors.",
            error 
        });
    }
};


// New route just for the drill-down
exports.getIndicatorMdaBreakdown = async (req, res) => {
    const { indicatorId, type } = req.query; // e.g., Outcome, Output
    const reportIds = await getApprovedReportIds(req.params.callId);

    const breakdown = await SpOutcomeIndicatorReport.findAll({
        where: { 
            spOutcomeIndicatorId: indicatorId,
            mdaReportId: { [Op.in]: reportIds }
        },
        include: [{ model: MdaReport, as: 'ParentReport', include: ['Mda'] }],
        raw: true, nest: true
    });

    res.json(breakdown); // Send only the small array of MDAs
};