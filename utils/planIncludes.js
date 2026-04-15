const { 
    StrategicPlan, PlanCall, Programme, SpObjective, Objective, 
    SpOutcome, Outcome, SpOutcomeIndicator, OutcomeIndicator, 
    SpOutcomeIndicatorTarget, SpIntermediateOutcome, IntermediateOutcome, 
    SpIntermediateOutcomeIndicator, IntermediateOutcomeIndicator, 
    SpIntermediateOutcomeIndicatorTarget, SpIntervention, Intervention, 
    SpOutput, Output, SpOutputIndicator, OutputIndicator, 
    SpOutputIndicatorTarget, SpOutputAction, OutputAction, 
    SpOutputActionBudget, Office, BudgetSource, NationalAlignment, NationalValue 
} = require('../models'); // Note: path is ../models from the utils folder

/**
 * Helper for National Data
 */
const getNationalInclude = (alias) => ({
    model: NationalAlignment,
    as: alias,
    include: [{ 
        model: NationalValue, 
        as: 'YearlyValues',
        separate: true
    }]
});

/**
 * THE FULL HIERARCHY
 */
const fullPlanStructure = [
    { model: PlanCall, as: 'Call' },
    { model: Programme, as: 'Programme' },
    { 
        model: SpObjective, as: 'SelectedObjectives',
        separate: true,
        include: [
            { model: Objective, as: 'LibraryObjective' },
            { 
                model: SpOutcome, as: 'SelectedOutcomes',
                separate: true,
                include: [
                    { model: Outcome, as: 'LibraryOutcome' },
                    { 
                        model: SpOutcomeIndicator, as: 'SelectedIndicators', 
                        include: [
                            { 
                                model: OutcomeIndicator, as: 'LibraryIndicator',
                                include: [getNationalInclude('OutcomeNational')] 
                            }, 
                            { model: SpOutcomeIndicatorTarget, as: 'Targets' },
                            { model: Office, as: 'ResponsibleOffice' }
                        ] 
                    },
                    {
                        model: SpIntermediateOutcome, as: 'SelectedIntermediates',
                        include: [
                            { model: IntermediateOutcome, as: 'LibraryIntermediate' },
                            {
                                model: SpIntermediateOutcomeIndicator, as: 'SelectedIndicators',
                                include: [
                                    { 
                                        model: IntermediateOutcomeIndicator, as: 'LibraryIndicator',
                                        include: [getNationalInclude('IntermediateNational')] 
                                    },
                                    { model: SpIntermediateOutcomeIndicatorTarget, as: 'Targets' },
                                    { model: Office, as: 'ResponsibleOffice' }
                                ]
                            },
                            {
                                model: SpIntervention, as: 'SelectedInterventions',
                                include: [
                                    { model: Intervention, as: 'LibraryIntervention' },
                                    {
                                        model: SpOutput, as: 'SelectedOutputs',
                                        include: [
                                            { model: Output, as: 'LibraryOutput' },
                                            { 
                                                model: SpOutputIndicator, as: 'SelectedIndicators', 
                                                include: [
                                                    { 
                                                        model: OutputIndicator, as: 'LibraryIndicator',
                                                        include: [getNationalInclude('OutputNational')] 
                                                    },
                                                    { model: SpOutputIndicatorTarget, as: 'Targets' },
                                                    { model: Office, as: 'ResponsibleOffice' }
                                                ] 
                                            },
                                            { 
                                                model: SpOutputAction, as: 'SelectedActions', 
                                                include: [
                                                    { model: OutputAction, as: 'LibraryAction' },
                                                    { model: SpOutputActionBudget, as: 'Budgets' },
                                                    { model: Office, as: 'ResponsibleOffice' },
                                                    { model: BudgetSource, as: 'BudgetSource' }
                                                ] 
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ] 
            }
        ] 
    }
];

module.exports = { fullPlanStructure };