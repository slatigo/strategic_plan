const { 
  MdaReport, ReportCall, StrategicPlan, 
  SpObjective, SpOutcome, SpOutcomeIndicator, SpOutcomeIndicatorReport,
  SpIntermediateOutcome, SpIntermediateOutcomeIndicator, SpIntermediateOutcomeIndicatorReport,
  SpOutput, SpOutputIndicator, SpOutputIndicatorReport,
  SpOutputAction, SpOutputActionReport,OutcomeIndicator,IntermediateOutcomeIndicator,OutputIndictor,NationalAlignment,NationalValue,SpIntervention,Intervention,OutputIndicator,Objective,Outcome,IntermediateOutcome,Output,OutputAction,SpOutputIndicatorTarget,SpOutcomeIndicatorTarget,SpIntermediateOutcomeIndicatorTarget,SpOutputActionBudget,Programme
} = require('../../models');
const reportHelper = require('../../utils/reportFetcher');

// MDA Version (For Editing)
exports.getReportEditor = async (req, res) => {
    const data = await reportHelper.getFullReportPackage(req.params.id);
    
    if (!data || data.report.mdaId !== req.user.mdaId) {
        return res.redirect('/mda/reports?error=notfound');
    }

    res.render('mda/reports/editor', {
        ...data,
        currentFY: data.report.Call.reportingYear,
        isLocked: ['Submitted', 'Approved', 'Under Review'].includes(data.report.status),
        user: req.user
    });
};

/**
 * GET /mda/reports
 * Landing page listing all reporting windows
 */
exports.getReportsLanding = async (req, res) => {
  try {
    const mdaId = req.user.mdaId;

    const reportCalls = await ReportCall.findAll({
      order: [['created_at', 'DESC']],
      include: [{
        model: MdaReport,
        as: 'MdaSubmissions', 
        where: { mdaId: mdaId },
        required: false // Left Join
      }]
    });


    res.render('mda/reports/index', {
      title: 'Quarterly Progress Reports',
      activePage: 'reports',
      user: req.user,
      reportCalls
    });
  } catch (error) {
    console.error('Error loading reports landing:', error);
    res.status(500).send('Error loading reporting windows');
  }
};

/**
 * GET /mda/reports/start/:callId
 * Initializes a new report envelope if it doesn't exist
 */
exports.startReport = async (req, res) => {
  try {
    const { callId } = req.params;
    const mdaId = req.user.mdaId;
    const userId = req.user.id;

    // 1. Find or Create the report envelope
    const [report, created] = await MdaReport.findOrCreate({
      where: { 
        reportCallId: callId, 
        mdaId: mdaId 
      },
      defaults: {
        userId: userId,
        status: 'Draft'
      }
    });

    // 2. Redirect to the editor with the MdaReport ID
    res.redirect(`/mda/reports/edit/${report.id}`);
  } catch (error) {
    console.error('Error starting report:', error);
    res.status(500).send('Could not initialize report');
  }
};


exports.saveReportProgress = async (req, res) => {
  try {
    const { mdaReportId, outcomes, intermediates, outputs, actions } = req.body;
    console.log(req.body)
    const saveTasks = [];

    // Helper to handle arrays (from duplicate inputs) and sanitize strings
    const sanitizeNum = (val) => {
      if (Array.isArray(val)) {
        // Take the first non-empty value from the array
        val = val.find(v => v !== '' && v !== null) || 0;
      }
      if (val === '' || val === null || val === undefined) return 0;
      // Remove commas and parse
      const cleaned = parseFloat(val.toString().replace(/,/g, ''));
      return isNaN(cleaned) ? 0 : cleaned;
    };

    // 1. Process Outcomes
    if (outcomes) {
      Object.values(outcomes).forEach(item => {
        if (item.id && item.id !== '0') {
          saveTasks.push(SpOutcomeIndicatorReport.upsert({
            mdaReportId,
            spOutcomeIndicatorId: item.id,
            actualValue: sanitizeNum(item.val),
            remarks: item.rem || null
          }));
        }
      });
    }

    // 2. Process Intermediates
    if (intermediates) {
      Object.values(intermediates).forEach(item => {
        if (item.id && item.id !== '0') {
          saveTasks.push(SpIntermediateOutcomeIndicatorReport.upsert({
            mdaReportId,
            spIntermediateOutcomeIndicatorId: item.id,
            actualValue: sanitizeNum(item.val),
            remarks: item.rem || null
          }));
        }
      });
    }

    // 3. Process Outputs
    if (outputs) {
      Object.values(outputs).forEach(item => {
        if (item.id && item.id !== '0') {
          saveTasks.push(SpOutputIndicatorReport.upsert({
            mdaReportId,
            spOutputIndicatorId: item.id,
            actualValue: sanitizeNum(item.val),
            remarks: item.rem || null
          }));
        }
      });
    }

    // 4. Process Actions
    if (actions) {
      Object.values(actions).forEach(item => {
        // Ensure we have an ID to save against
        if (item.id && item.id !== '0') {
          saveTasks.push(SpOutputActionReport.upsert({
            mdaReportId,
            spOutputActionId: item.id,
            actualExpenditure: sanitizeNum(item.spend),
            remarks: item.rem || null
          }));
        }
      });
    }

    await Promise.all(saveTasks);
    
    // Add return to prevent double-response bugs
    return res.json({ success: true, message: "Draft saved successfully" });

  } catch (error) {
    console.error("Save Error:", error);
    // Safety check: don't try to send a second response if headers already sent
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

exports.submitFinalReport = async (req, res) => {
  try {
    // We reuse the save logic first to ensure the latest data is captured
    await exports.saveReportProgress(req, res); 
    
    const { mdaReportId } = req.body;

    await MdaReport.update({
      status: 'Submitted',
      submissionDate: new Date()
    }, {
      where: { id: mdaReportId }
    });

    // Note: In saveReportProgress above, it redirects. 
    // You might need to adjust saveReportProgress to return a Promise instead 
    // of redirecting if you want to call it directly like this.
  } catch (error) {
    res.status(500).send('Submission failed.');
  }
};