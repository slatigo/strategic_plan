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

const { QueryTypes } = require('sequelize');

exports.getNationalAnalysis = async (req, res) => {
    try {
        const { id } = req.params;
        const snapshot = await ReportCall.findByPk(id);
        if (!snapshot) return res.status(404).send("Report call not found.");
        
        const reportingYear = snapshot.reportingYear;
        const replacements = { id, reportingYear };

        // --- 1. DEFINE QUERIES ---
        const macroQuery = `
            SELECT ob.objective_name, ob.objective_code, oc.outcome AS macro_outcome, oc.outcome_code AS macro_code,
            oi.indicator_code, oi.indicator AS indicator_name, na.unit_of_measure, na.polarity, nv.value AS national_val, 
            sp_oir.actual_value, mr.mda_id AS report_mda_id, mdas.name AS mda_name
            FROM outcome_indicators AS oi 
            JOIN outcomes AS oc ON oi.outcome_id = oc.id
            JOIN objectives AS ob ON oc.objective_id = ob.id
            JOIN nationalalignments AS na ON oi.indicator_code = na.indicator_code 
            JOIN nationalvalues AS nv ON nv.indicator_code = na.indicator_code AND nv.target_year = :reportingYear 
            LEFT JOIN sp_outcome_indicators AS sp_oi ON sp_oi.outcome_indicator_id = oi.id  
            LEFT JOIN sp_outcome_indicator_reports AS sp_oir ON sp_oir.sp_outcome_indicator_id = sp_oi.id
            LEFT JOIN mda_reports AS mr ON sp_oir.mda_report_id = mr.id AND mr.report_call_id = :id AND mr.status = 'Approved'
            LEFT JOIN mdas ON mr.mda_id = mdas.id`;

        const interQuery = `
            SELECT ob.objective_name, ob.objective_code, oc.outcome AS macro_outcome, oc.outcome_code AS macro_code,
            io.intermediate_outcome, io.intermediate_outcome_code, ioi.indicator_code, ioi.indicator AS indicator_name,
            na.unit_of_measure, na.polarity, nv.value AS national_val, sp_ioir.actual_value,
            mr.mda_id AS report_mda_id, mdas.name AS mda_name
            FROM intermediate_outcome_indicators AS ioi 
            JOIN intermediate_outcomes AS io ON ioi.intermediate_outcome_id = io.id
            JOIN outcomes AS oc ON io.outcome_id = oc.id
            JOIN objectives AS ob ON oc.objective_id = ob.id
            JOIN nationalalignments AS na ON ioi.indicator_code = na.indicator_code 
            JOIN nationalvalues AS nv ON nv.indicator_code = na.indicator_code AND nv.target_year = :reportingYear 
            LEFT JOIN sp_intermediate_outcome_indicators AS sp_ioi ON sp_ioi.intermediate_outcome_indicator_id = ioi.id  
            LEFT JOIN sp_intermediate_outcome_indicator_reports AS sp_ioir ON sp_ioir.sp_intermediate_outcome_indicator_id = sp_ioi.id
            LEFT JOIN mda_reports AS mr ON sp_ioir.mda_report_id = mr.id AND mr.report_call_id = :id AND mr.status = 'Approved'
            LEFT JOIN mdas ON mr.mda_id = mdas.id`;

        const outputQuery = `
            SELECT ob.objective_name, ob.objective_code, oc.outcome AS macro_outcome, oc.outcome_code AS macro_code,
            io.intermediate_outcome, io.intermediate_outcome_code, inv.intervention AS intervention_name, opt.output AS output_name,
            opi.indicator_code, opi.indicator AS indicator_name, na.unit_of_measure, na.polarity, nv.value AS national_val, 
            sp_opir.actual_value, mr.mda_id AS report_mda_id, mdas.name AS mda_name
            FROM output_indicators AS opi 
            JOIN outputs AS opt ON opi.output_id = opt.id
            JOIN interventions AS inv ON opt.intervention_id = inv.id
            JOIN intermediate_outcomes AS io ON inv.intermediate_outcome_id = io.id
            JOIN outcomes AS oc ON io.outcome_id = oc.id
            JOIN objectives AS ob ON oc.objective_id = ob.id
            JOIN nationalalignments AS na ON opi.indicator_code = na.indicator_code 
            JOIN nationalvalues AS nv ON nv.indicator_code = na.indicator_code AND nv.target_year = :reportingYear 
            LEFT JOIN sp_output_indicators AS sp_opi ON sp_opi.output_indicator_id = opi.id  
            LEFT JOIN sp_output_indicator_reports AS sp_opir ON sp_opir.sp_output_indicator_id = sp_opi.id
            LEFT JOIN mda_reports AS mr ON sp_opir.mda_report_id = mr.id AND mr.report_call_id = :id AND mr.status = 'Approved'
            LEFT JOIN mdas ON mr.mda_id = mdas.id`;

        const actionQuery = `
            SELECT ob.objective_name, ob.objective_code, oc.outcome AS macro_outcome, oc.outcome_code AS macro_code,
            io.intermediate_outcome, io.intermediate_outcome_code, inv.intervention AS intervention_name, opt.output AS output_name,
            act.action AS action_name, act.action_code, na.unit_of_measure, 'Lower is Better' AS polarity, nv.value AS national_budget, 
            sp_opar.actual_expenditure AS actual_spent, mr.mda_id AS report_mda_id, mdas.name AS mda_name
            FROM output_actions AS act 
            JOIN outputs AS opt ON act.output_id = opt.id
            JOIN interventions AS inv ON opt.intervention_id = inv.id
            JOIN intermediate_outcomes AS io ON inv.intermediate_outcome_id = io.id
            JOIN outcomes AS oc ON io.outcome_id = oc.id
            JOIN objectives AS ob ON oc.objective_id = ob.id
            JOIN nationalalignments AS na ON act.action_code = na.indicator_code 
            JOIN nationalvalues AS nv ON nv.indicator_code = na.indicator_code AND nv.target_year = :reportingYear 
            LEFT JOIN sp_output_actions AS sp_oa ON sp_oa.output_action_id = act.id  
            LEFT JOIN sp_output_action_reports AS sp_opar ON sp_opar.sp_output_action_id = sp_oa.id
            LEFT JOIN mda_reports AS mr ON sp_opar.mda_report_id = mr.id AND mr.report_call_id = :id AND mr.status = 'Approved'
            LEFT JOIN mdas ON mr.mda_id = mdas.id`;

        // --- 2. EXECUTE QUERIES ---
        const [mResults, iResults, oResults, aResults] = await Promise.all([
            sequelize.query(macroQuery, { replacements, type: QueryTypes.SELECT }),
            sequelize.query(interQuery, { replacements, type: QueryTypes.SELECT }),
            sequelize.query(outputQuery, { replacements, type: QueryTypes.SELECT }),
            sequelize.query(actionQuery, { replacements, type: QueryTypes.SELECT })
        ]);

        const metricsMap = new Map();
        const groupedData = {};

        // Units that represent rates or ratios and must be averaged across MDAs
        const unitsToAverage = [
            '%', 'Ratio (X:1)', 'Ratio (1:X)', 'Per capita', 
            'Rate per 100,000', 'Rate per 1000', 'Years'
        ];

        // --- 3. PROCESS RESULTS HELPER ---
        const processResults = (results, levelType) => {
            results.forEach(row => {
                const code = row.indicator_code || row.action_code;
                if (!code) return;

                if (!metricsMap.has(code)) {
                    metricsMap.set(code, {
                        type: levelType,
                        code: code,
                        name: row.indicator_name || row.action_name,
                        unit: row.unit_of_measure || (levelType === 'ACTION' ? 'UGX' : 'Units'),
                        polarity: row.polarity || 'Incr',
                        target: parseFloat(row.national_val || row.national_budget || 0),
                        runningSum: 0,
                        reportCount: 0,
                        mdaReports: [],
                        parentName: row.macro_outcome || row.objective_name,
                        typeColor: levelType === 'MACRO' ? 'success' : levelType === 'INTER' ? 'primary' : 'warning'
                    });
                }

                const metric = metricsMap.get(code);

                // Add MDA reported values
                if (row.actual_value !== null || row.actual_spent !== null) {
                    const val = parseFloat(row.actual_value || row.actual_spent || 0);
                    metric.runningSum += val;
                    metric.reportCount += 1;
                    
                    const alreadyExists = metric.mdaReports.find(r => r.mda === row.mda_name);
                    if (!alreadyExists && row.mda_name) {
                        metric.mdaReports.push({ mda: row.mda_name, value: val.toLocaleString() });
                    }
                }

                // A. Determine the National Actual (Average vs Sum)
                let finalValue = metric.runningSum;
                if (unitsToAverage.includes(metric.unit) && metric.reportCount > 0) {
                    finalValue = metric.runningSum / metric.reportCount;
                }

                // B. Calculate Achievement based on Polarity
                let achievement = 0;
                const target = metric.target;

                if (target > 0) {
                    if (metric.polarity === 'Decr' || metric.polarity === 'Negative') {
                        // Formula for things we want to decrease (e.g. Mortality)
                        achievement = finalValue > 0 ? (target / finalValue) * 100 : 100;
                    } else {
                        // Formula for things we want to increase (e.g. Literacy)
                        achievement = (finalValue / target) * 100;
                    }
                }

                // C. Format and update for views
                metric.nationalActual = finalValue.toLocaleString(undefined, { maximumFractionDigits: 2 });
                metric.nationalTarget = (target || 0).toLocaleString();
                metric.achievement = achievement.toFixed(1);
                metric.totalMdas = metric.mdaReports.length;

                // --- 4. TREE BUILDING (HIERARCHY VIEW) ---
                if (!metric.isNested) {
                    if (!groupedData[row.objective_name]) {
                        groupedData[row.objective_name] = { code: row.objective_code, macroOutcomes: {} };
                    }
                    const obj = groupedData[row.objective_name];

                    if (!obj.macroOutcomes[row.macro_outcome]) {
                        obj.macroOutcomes[row.macro_outcome] = { code: row.macro_code, macroIndicators: [], intermediates: {} };
                    }
                    const macro = obj.macroOutcomes[row.macro_outcome];

                    if (levelType === 'MACRO') {
                        macro.macroIndicators.push(metric);
                    } else {
                        const interKey = row.intermediate_outcome || 'General';
                        if (!macro.intermediates[interKey]) {
                            macro.intermediates[interKey] = { code: row.intermediate_outcome_code, interIndicators: [], interventions: {} };
                        }
                        const inter = macro.intermediates[interKey];

                        if (levelType === 'INTER') {
                            inter.interIndicators.push(metric);
                        } else {
                            const invKey = row.intervention_name || 'General Intervention';
                            if (!inter.interventions[invKey]) {
                                inter.interventions[invKey] = { outputs: {} };
                            }
                            const intervention = inter.interventions[invKey];

                            const outKey = row.output_name || 'General Output';
                            if (!intervention.outputs[outKey]) {
                                intervention.outputs[outKey] = { indicators: [], actions: [] };
                            }
                            const output = intervention.outputs[outKey];

                            if (levelType === 'OUTPUT') output.indicators.push(metric);
                            if (levelType === 'ACTION') output.actions.push(metric);
                        }
                    }
                    metric.isNested = true; 
                }
            });
        };

        // Process each result set
        processResults(mResults, 'MACRO');
        processResults(iResults, 'INTER');
        processResults(oResults, 'OUTPUT');
        processResults(aResults, 'ACTION');

        const allMetricsFlat = Array.from(metricsMap.values());
        const view = req.query.view === 'focus' ? 'npa/reports/analysis_indicator_focus' : 'npa/reports/analysis';

        res.render(view, { 
            results: groupedData, 
            allMetrics: allMetricsFlat, 
            snapshot, 
            title: `National Analysis - ${snapshot.reportingYear}` 
        });

    } catch (error) {
        console.error("ANALYSIS ERROR:", error);
        res.status(500).json({ error: error.message });
    }
};

const getApprovedReportIds = async (reportCallId) => {
	const reports = await MdaReport.findAll({
		where: { 
			reportCallId: reportCallId, 
			status: 'Approved' 
		},
		attributes: ['id'],
		raw: true
	});
	
	// Returns an array of IDs: [1, 2, 5, 12...]
	return reports.map(r => r.id);
};
