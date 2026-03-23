const { 
    MdaReport, ReportCall, StrategicPlan, Programme, SpObjective, Objective, 
    SpOutcome, Outcome, SpOutcomeIndicator, OutcomeIndicator, SpOutcomeIndicatorTarget,
    SpIntermediateOutcome, IntermediateOutcome, SpIntermediateOutcomeIndicator, 
    IntermediateOutcomeIndicator, SpIntermediateOutcomeIndicatorTarget,
    SpIntervention, SpOutput, Output, SpOutputIndicator, OutputIndicator, 
    SpOutputIndicatorTarget, SpOutputAction, OutputAction, SpOutputActionBudget,
    SpOutcomeIndicatorReport, SpIntermediateOutcomeIndicatorReport, 
    SpOutputIndicatorReport, SpOutputActionReport, NationalAlignment, NationalValue,
    ReportComment, User,Mda
} = require('../models');

/**
 * Fetches a complete Report "Package" including the Strategic Plan and all Progress Entries
 */
exports.getFullReportPackage = async (reportId) => {
    // 1. Fetch the Report Envelope & its Entries
    const report = await MdaReport.findByPk(reportId, {
        include: [
            { model: Mda, as: 'Mda' },
            { model: ReportCall, as: 'Call' },
            { model: SpOutcomeIndicatorReport, as: 'OutcomeEntries' },
            { model: SpIntermediateOutcomeIndicatorReport, as: 'IntermediateEntries' },
            { model: SpOutputIndicatorReport, as: 'OutputEntries' },
            { model: SpOutputActionReport, as: 'ActionEntries' },
            { 
                model: ReportComment, 
                as: 'Comments',
                include: [{ model: User, as: 'Author', attributes: ['name', 'role'] }]
            }
        ],
        order: [[{ model: ReportComment, as: 'Comments' }, 'created_at', 'ASC']]
    });

    if (!report) return null;

    // Helper for National Alignment nesting
    const getNationalInclude = (alias) => ({
        model: NationalAlignment,
        as: alias,
        include: [{ model: NationalValue, as: 'YearlyValues', separate: true }]
    });

    // 2. Fetch the Strategic Plan Framework
    const plan = await StrategicPlan.findOne({
        where: { 
            mdaId: report.mdaId, 
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
                                model: SpOutcomeIndicator, as: 'SelectedIndicators',
                                include: [
                                    { model: OutcomeIndicator, as: 'LibraryIndicator', include: [getNationalInclude('OutcomeNational')] },
                                    { model: SpOutcomeIndicatorTarget, as: 'Targets', required: false }
                                ] 
                            },
                            {
                                model: SpIntermediateOutcome,
                                as: 'SelectedIntermediates',
                                include: [
                                    { model: IntermediateOutcome, as: 'LibraryIntermediate' }, 
                                    { 
                                        model: SpIntermediateOutcomeIndicator, as: 'SelectedIndicators',
                                        include: [
                                            { model: IntermediateOutcomeIndicator, as: 'LibraryIndicator', include: [getNationalInclude('IntermediateNational')] },
                                            { model: SpIntermediateOutcomeIndicatorTarget, as: 'Targets', required: false }
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
                                                    model: SpOutputIndicator, as: 'SelectedIndicators',
                                                    include: [
                                                        { model: OutputIndicator, as: 'LibraryIndicator', include: [getNationalInclude('OutputNational')] },
                                                        { model: SpOutputIndicatorTarget, as: 'Targets', required: false }
                                                    ]
                                                },
                                                { 
                                                    model: SpOutputAction, as: 'SelectedActions',
                                                    include: [
                                                        { model: OutputAction, as: 'LibraryAction' },
                                                        { model: SpOutputActionBudget, as: 'Budgets', required: false }
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

    return {
        report: report.get({ plain: true }),
        plan: plan ? plan.get({ plain: true }) : { SelectedObjectives: [] }
    };
};