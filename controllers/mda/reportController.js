const { 
  MdaReport, ReportCall, StrategicPlan, 
  SpObjective, SpOutcome, SpOutcomeIndicator, SpOutcomeIndicatorReport,
  SpIntermediateOutcome, SpIntermediateOutcomeIndicator, SpIntermediateOutcomeIndicatorReport,
  SpOutput, SpOutputIndicator, SpOutputIndicatorReport,
  SpOutputAction, SpOutputActionReport,OutcomeIndicator,IntermediateOutcomeIndicator,OutputIndictor,NationalAlignment,NationalValues,SpIntervention,Intervention,OutputIndicator,Objective,Outcome,IntermediateOutcome,Output,OutputAction,SpOutputIndicatorTarget,SpOutcomeIndicatorTarget,SpIntermediateOutcomeIndicatorTarget,SpOutputActionBudget,Programme
} = require('../../models');
exports.getReportEditor = async (req, res) => {
  try {
    const { id } = req.params;
    const mdaId = req.user.mdaId;

    // 1. Fetch the Report Envelope with existing entries
    const report = await MdaReport.findByPk(id, {
      include: [
        { model: ReportCall, as: 'Call' },
        { model: SpOutcomeIndicatorReport, as: 'OutcomeEntries' },
        { model: SpIntermediateOutcomeIndicatorReport, as: 'IntermediateEntries' },
        { model: SpOutputIndicatorReport, as: 'OutputEntries' },
        { model: SpOutputActionReport, as: 'ActionEntries' }
      ]
    });

    if (!report || report.mdaId !== mdaId) {
      return res.redirect('/mda/reports?error=notfound');
    }

    // 2. Fix the "FY" Logic: 
    // Construct the string "2025/26" from the reportingYear "2025"
    const currentFY  = report.Call.reportingYear; 

    // 3. Fetch the Strategic Plan + Library Data + Yearly Targets/Budgets
    const plan = await StrategicPlan.findOne({
      where: { 
        mdaId: mdaId, 
        callId: report.Call.planCallId 
      },
      include: [
        { model: Programme, as: 'Programme' },
        {
          model: SpObjective,
          as: 'SelectedObjectives',
          include: [
            { model: Objective, as: 'LibraryObjective' }, 
            {
              model: SpOutcome,
              as: 'SelectedOutcomes',
              include: [
                { model: Outcome, as: 'LibraryOutcome' }, 
                { 
                  model: SpOutcomeIndicator, 
                  as: 'SelectedIndicators',
                  include: [
                    { 
                      model: OutcomeIndicator, 
                      as: 'LibraryIndicator',
                      include: [{ model: NationalAlignment, as: 'NationalData' }] 
                    },
                    { 
                      model: SpOutcomeIndicatorTarget, 
                      as: 'Targets', 
                      where: { fy: currentFY }, 
                      required: false 
                    }
                  ] 
                },
                {
                  model: SpIntermediateOutcome,
                  as: 'SelectedIntermediates',
                  include: [
                    { model: IntermediateOutcome, as: 'LibraryIntermediate' }, 
                    { 
                      model: SpIntermediateOutcomeIndicator, 
                      as: 'SelectedIndicators',
                      include: [
                        { model: IntermediateOutcomeIndicator, as: 'LibraryIndicator' },
                        { 
                          model: SpIntermediateOutcomeIndicatorTarget, 
                          as: 'Targets', 
                          where: { fy: currentFY }, 
                          required: false 
                        }
                      ]
                    },
                    {
                      model: SpIntervention,
                      as: 'SelectedInterventions',
                      include: [{
                        model: SpOutput,
                        as: 'SelectedOutputs',
                        include: [
                          { model: Output, as: 'LibraryOutput' }, 
                          { 
                            model: SpOutputIndicator, 
                            as: 'SelectedIndicators',
                            include: [
                              { model: OutputIndicator, as: 'LibraryIndicator' },
                              { 
                                model: SpOutputIndicatorTarget, 
                                as: 'Targets', 
                                where: { fy: currentFY }, 
                                required: false 
                              }
                            ]
                          },
                          { 
                            model: SpOutputAction, 
                            as: 'SelectedActions',
                            include: [
                              { model: OutputAction, as: 'LibraryAction' },
                              { 
                                model: SpOutputActionBudget, 
                                as: 'Budgets', 
                                where: { fy: currentFY }, 
                                required: false 
                              }
                            ] 
                          }
                        ]
                      }]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });


    // 4. Convert to plain objects so Getters and Virtuals function correctly in Pug
    const plainReport = report.get({ plain: true });
    const plainPlan = plan ? plan.get({ plain: true }) : { SelectedObjectives: [] };
    const isLocked = ['Submitted', 'Approved', 'Under Review'].includes(report.status);
    res.render('mda/reports/editor', {
      title: `Performance Editor | ${report.Call ? report.Call.getName() : 'Quarterly Report'}`,
      activePage: 'reports',
      report: plainReport,
      plan: plainPlan,
      isLocked: isLocked,
      user: req.user
    });

  } catch (error) {
    console.error('Editor Load Error:', error);
    res.status(500).send('Error loading performance editor: ' + error.message);
  }
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