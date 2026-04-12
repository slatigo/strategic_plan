/**
 * Strategic Plan Editor JS - Unified Final Version (FIXED)
 * Handles Objectives, Outcomes, Intermediates, Interventions, Outputs, and Actions
 */

// ============================================
// 1. UTILITY FUNCTIONS
// ============================================

/**
 * Formats a number with commas for currency display
 */
const formatCurrency = (val) => {
    if (!val && val !== 0) return "";
    const num = parseFloat(String(val).replace(/,/g, ''));
    return isNaN(num) ? "" : num.toLocaleString('en-US');
};

/**
 * Unified delete confirmation helper
 */
async function confirmDelete(url, text = "This cannot be undone.") {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it'
    });
    
    if (result.isConfirmed) {
        try {
            const response = await fetch(url, { method: 'DELETE' });
            const data = await response.json();
            if (data.status === 'success' || data.success) {
                Swal.fire('Deleted!', 'Item has been removed.', 'success')
                    .then(() => window.location.reload());
            } else {
                Swal.fire('Error', data.message || 'Could not delete', 'error');
            }
        } catch (err) {
            Swal.fire('Error', 'Communication with server failed', 'error');
        }
    }
}

/**
 * Updates unit labels in forms
 */

function updateUnitLabels(form, unitText) {
    if (!form) return;
    const displayUnit = (unitText && unitText.trim()) ? unitText.trim() : '---';
    form.querySelectorAll('.unit-append, .unit-label').forEach(span => {
        if (span) span.innerText = displayUnit;
    });
}

/**
 * Updates National Reference displays in indicator modals
 */
function updateNationalReference(form, indicator, alias) {
    if (!form) return;
    
    const customToggle = form.querySelector('[id$="_custom_toggle"]');
    const isCustomMode = customToggle ? customToggle.checked : false;
    
    // Get the national data from the indicator using the alias
    const nationalData = (!isCustomMode && indicator) ? indicator[alias] : null;
    
    let unit = "";
    
    if (isCustomMode) {
        // Custom mode: get unit from dropdown
        const customUnitSelect = form.querySelector('[name="customUnit"]');
        unit = customUnitSelect ? customUnitSelect.value : "";
    } else if (nationalData) {
        // Library mode: get unit from the nested national data
        unit = nationalData.unit_of_measure || '';
    } else if (indicator) {
        // Fallback: try direct properties
        unit = indicator.unit_of_measure || indicator.unit || '';
    }
    
    const displayUnit = (unit && unit.trim()) ? unit.trim() : '---';
    
    // Update unit badge
    let badge = form.querySelector('[id$="_unit_badge"]');
    if (!badge) badge = document.getElementById(`${form.id.replace('Form', '')}_unit_badge`);
    if (badge) badge.textContent = `Unit: ${displayUnit}`;
    
    // Update all unit displays
    updateUnitLabels(form, displayUnit);
    
    // Handle baseline input
    const baselineInput = form.querySelector('[name="baselineValue"]');
    if (baselineInput) {
        if (indicator || isCustomMode) {
            baselineInput.removeAttribute('readonly');
            baselineInput.style.backgroundColor = "#ffffff";
            baselineInput.placeholder = unit ? `Enter baseline (${unit})...` : "Enter baseline...";
        } else {
            baselineInput.placeholder = "Select an indicator first...";
            baselineInput.value = "";
            baselineInput.setAttribute('readonly', true);
            baselineInput.style.backgroundColor = "#e9ecef";
        }
    }
    
    // Update NDP target labels using the national data
    if (!isCustomMode && nationalData && nationalData.YearlyValues) {
        // Determine the correct ID prefix
        let idPrefix = "";
        if (form.id === 'outputIndicatorForm' || (alias && alias.toLowerCase().includes("output"))) {
            idPrefix = "out_";
        } else if (form.id === 'intIndicatorForm' || (alias && alias.toLowerCase().includes("intermediate"))) {
            idPrefix = "int_";
        }
        
        nationalData.YearlyValues.forEach(nv => {
            // Try to find label with or without prefix
            let label = form.querySelector(`#${idPrefix}nat_val_${nv.target_year}`);
            if (!label && !idPrefix) {
                label = form.querySelector(`#nat_val_${nv.target_year}`);
            }
            if (!label && idPrefix === "out_") {
                label = form.querySelector(`#out_nat_val_${nv.target_year}`);
            }
            
            if (label) {
                const formattedVal = nv.value ? nv.value.toLocaleString() : '0';
                const isCurrency = unit && unit.toUpperCase() === 'UGX';
                const genericUnits = ['number', 'qty', 'count', 'quantity', '---', '', 'ratio', 'years'];
                const isGeneric = genericUnits.some(term => unit && unit.toLowerCase().includes(term));
                
                if (isCurrency) {
                    label.textContent = `UGX ${formattedVal}`;
                } else if (isGeneric) {
                    label.textContent = formattedVal;
                } else {
                    label.textContent = unit ? `${formattedVal} ${unit}` : formattedVal;
                }
            }
        });
    }
}

// ============================================
// 2. DOM CONTENT LOADED - MAIN INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- OBJECTIVE FORM SUBMISSION ---
    const objectiveForm = document.getElementById('objectiveForm');
    if (objectiveForm) {
        objectiveForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                const response = await fetch(e.target.action, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.status === 'success') {
                    Swal.fire('Saved!', 'Objective added successfully.', 'success')
                        .then(() => window.location.reload());
                } else {
                    Swal.fire('Error', result.message, 'error');
                }
            } catch (err) {
                Swal.fire('Error', 'Something went wrong', 'error');
            }
        });
    }
    
    // --- GLOBAL UI TOGGLES (Adaptation & Custom) ---
    document.addEventListener('change', (e) => {
        // Adaptation Textarea Toggle
        if (e.target && e.target.classList.contains('adapt-toggle')) {
            const containerId = e.target.getAttribute('data-target-container');
            const container = document.getElementById(containerId);
            if (container) {
                container.style.display = e.target.checked ? 'block' : 'none';
            }
        }
        
        // Custom Indicator/Action Toggle
        if (e.target && e.target.id && e.target.id.includes('_custom_toggle')) {
            const prefix = e.target.id.split('_')[0];
            const libBox = document.getElementById(`${prefix}_library_container`);
            const custBox = document.getElementById(`${prefix}_custom_container`);
            
            if (libBox && custBox) {
                const isCustom = e.target.checked;
                libBox.style.display = isCustom ? 'none' : 'block';
                custBox.style.display = isCustom ? 'block' : 'none';
                
                const libSelect = libBox.querySelector('select');
                const custInput = custBox.querySelector('input, select');
                
                if (isCustom) {
                    if (libSelect) libSelect.removeAttribute('required');
                    if (custInput) custInput.setAttribute('required', 'required');
                } else {
                    if (libSelect) libSelect.setAttribute('required', 'required');
                    if (custInput) custInput.removeAttribute('required');
                }
            }
        }
    });
    
    // --- UNIFIED INDICATOR FORM SUBMISSION ---
    const indicatorForms = ['outcomeIndicatorForm', 'intIndicatorForm', 'outputIndicatorForm'];
    const endpointMap = {
        'outcomeIndicatorForm': '/mda/plans/indicators/save',
        'intIndicatorForm': '/mda/api/plan/save-int-indicator',
        'outputIndicatorForm': '/mda/api/plan/save-output-indicator'
    };
    
    indicatorForms.forEach(formId => {
        const form = document.getElementById(formId);
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const payload = Object.fromEntries(formData.entries());
            
            // Cleanup IDs (Convert empty strings to null)
            const idFields = [
                'id', 'spOutcomeId', 'spIntermediateOutcomeId', 'spOutputId',
                'outcomeIndicatorId', 'intermediateOutcomeIndicatorId',
                'outputIndicatorId', 'responsibleOfficeId'
            ];
            idFields.forEach(field => {
                if (payload[field] === '') payload[field] = null;
            });
            
            delete payload.planId;
            
            // Custom vs Adaptation Logic
            const isCustom = payload.is_custom === 'on';
            if (isCustom) {
                payload.outcomeIndicatorId = null;
                payload.intermediateOutcomeIndicatorId = null;
                payload.outputIndicatorId = null;
            } else {
                const adaptToggle = e.target.querySelector('.adapt-toggle');
                if (adaptToggle && !adaptToggle.checked) {
                    const levelName = formId.replace('IndicatorForm', '').replace('int', 'Intermediate');
                    const fieldName = `adapted${levelName.charAt(0).toUpperCase() + levelName.slice(1)}Indicator`;
                    payload[fieldName] = null;
                }
            }
            
            // Capture Yearly Targets
            payload.targets = {};
            for (let [key, value] of formData.entries()) {
                if (key.startsWith('targets[')) {
                    const yearMatch = key.match(/\[(\d+)\]/);
                    if (yearMatch && yearMatch[1]) {
                        const year = yearMatch[1];
                        payload.targets[year] = value.replace(/,/g, '').trim();
                        delete payload[key];
                    }
                }
            }
            
            try {
                const res = await fetch(endpointMap[formId], {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (result.status === 'success') {
                    Swal.fire('Saved', 'Indicator saved successfully', 'success')
                        .then(() => location.reload());
                } else {
                    Swal.fire('Error', result.message, 'error');
                }
            } catch (err) {
                console.error('Indicator save error:', err);
                Swal.fire('Error', 'Server communication failure', 'error');
            }
        });
    });
 const actionForm = document.getElementById('actionForm');
if (actionForm) {
    actionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Just get the raw data
        const formData = new FormData(actionForm);

        const payload = Object.fromEntries(formData.entries());
        

        console.log("DEBUG PAYLOAD:", payload);

        try {
            const res = await fetch('/mda/api/plan/save-output-action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            console.log("SERVER RESPONSE:", result);
            
            if (result.status === 'success') {
                Swal.fire('Saved!', '', 'success').then(() => location.reload());
            } else {
                Swal.fire('Error', result.message, 'error');
            }
        } catch (err) {
            console.error('Fetch Error:', err);
        }
    });
}
    // --- STRUCTURAL FORMS (Intermediate, Intervention, Output) ---
    const otherForms = [
        { id: 'intermediateForm', url: '/mda/api/plan/save-intermediate' },
        { id: 'interventionForm', url: '/mda/api/plan/save-intervention' },
        { id: 'outputForm', url: '/mda/api/plan/save-output' }
    ];
    
    otherForms.forEach(cfg => {
        const formEl = document.getElementById(cfg.id);
        if (!formEl) return;
        
        formEl.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formEl);
            const payload = Object.fromEntries(formData.entries());
            
            delete payload.planId;
            const idFields = [
                'spOutcomeId', 'spIntermediateOutcomeId', 'spInterventionId',
                'libraryIntId', 'libraryInterventionId', 'libraryOutputId'
            ];
            idFields.forEach(field => {
                if (payload[field] === '') payload[field] = null;
            });
            
            try {
                const res = await fetch(cfg.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (result.status === 'success') {
                    Swal.fire('Saved!', 'Item saved successfully', 'success')
                        .then(() => location.reload());
                } else {
                    Swal.fire('Error', result.message, 'error');
                }
            } catch (err) {
                console.error('Save error:', err);
                Swal.fire('Error', 'Connection failed', 'error');
            }
        });
    });
    
    // --- LIVE BUDGET TOTAL UPDATES ---
    document.addEventListener('input', (e) => {
        if (e.target.matches('#actionForm input[data-type="currency"]')) {
            // Format the current input
            if (e.target.value) {
                e.target.value = formatCurrency(e.target.value);
            }
            
            // Calculate grand total
            let total = 0;
            const form = e.target.closest('#actionForm');
            const display = document.getElementById('action_total_display');
            
            if (form && display) {
                const inputs = form.querySelectorAll('input[data-type="currency"]');
                inputs.forEach(input => {
                    const val = parseFloat(input.value.replace(/,/g, '')) || 0;
                    total += val;
                });
                display.innerText = total.toLocaleString('en-US');
            }
        }
    });
});

// ============================================
// 3. MODAL PREPARATION FUNCTIONS
// ============================================

/**
 * Prepare Outcome Modal
 */
async function prepareOutcomeModal(spObjectiveId, libraryObjectiveId, objName) {
    const hiddenInput = document.getElementById('modal_sp_objective_id');
    const displayObj = document.getElementById('display_obj_name');
    const select = document.getElementById('outcome_library_id');
    
    if (hiddenInput) hiddenInput.value = spObjectiveId;
    if (displayObj) displayObj.innerText = objName;
    
    try {
        const res = await fetch(`/mda/api/library-outcomes?objectiveId=${libraryObjectiveId}&spObjectiveId=${spObjectiveId}`);
        const outcomes = await res.json();
        
        if (select) {
            select.innerHTML = '<option value="" disabled selected>-- Select Outcome --</option>';
            outcomes.forEach(o => {
                select.appendChild(new Option(`${o.outcomeCode}: ${o.outcomeName}`, o.id));
            });
        }
        
        const modal = document.getElementById('addOutcomeModal');
        if (modal && typeof bootstrap !== 'undefined') {
            bootstrap.Modal.getOrCreateInstance(modal).show();
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to load outcomes', 'error');
    }
}

/**
 * Save Outcome Button Handler
 */
document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('saveOutcomeBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const spObjectiveId = document.getElementById('modal_sp_objective_id')?.value;
            const outcomeId = document.getElementById('outcome_library_id')?.value;
            
            if (!outcomeId) {
                return Swal.fire('Wait!', 'Please select an outcome first.', 'warning');
            }
            
            const originalText = saveBtn.innerHTML;
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
            
            try {
                const response = await fetch('/mda/plans/outcomes/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ spObjectiveId, outcomeId })
                });
                
                const result = await response.json();
                
                if (result.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Linked!',
                        text: 'Outcome has been added.',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => window.location.reload());
                } else {
                    Swal.fire('Error', result.message || 'Failed to save', 'error');
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = originalText;
                }
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'Server communication failed', 'error');
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalText;
            }
        });
    }
});

/**
 * Prepare Intermediate Modal
 */
async function prepareIntermediateModal(spOutcomeId) {
    const select = document.getElementById('libraryIntSelect');
    const hiddenIdInput = document.getElementById('modal_parent_outcome_id');
    
    if (hiddenIdInput) hiddenIdInput.value = spOutcomeId;
    if (select) {
        select.innerHTML = '<option>Loading...</option>';
        
        try {
            const res = await fetch(`/mda/api/library/intermediate-outcomes/${spOutcomeId}`);
            const data = await res.json();
            select.innerHTML = '<option value="">-- Select Intermediate Outcome --</option>';
            data.forEach(item => {
                select.appendChild(new Option(item.intermediateOutcome, item.id));
            });
            
            const modal = document.getElementById('addIntermediateModal');
            if (modal && typeof bootstrap !== 'undefined') {
                bootstrap.Modal.getOrCreateInstance(modal).show();
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Failed to load intermediate outcomes', 'error');
        }
    }
}

/**
 * Prepare Intervention Modal
 */
async function prepareInterventionModal(parentId) {
    const select = document.getElementById('libraryInvSelect');
    const hiddenInput = document.getElementById('modal_sp_int_parent_id');
    
    if (hiddenInput) hiddenInput.value = parentId;
    if (select) {
        select.innerHTML = '<option>Loading...</option>';
        
        try {
            const res = await fetch(`/mda/api/library/interventions/${parentId}`);
            const data = await res.json();
            select.innerHTML = '<option value="">-- Select Intervention --</option>';
            data.forEach(item => {
                select.appendChild(new Option(item.intervention, item.id));
            });
            
            const modal = document.getElementById('addInterventionModal');
            if (modal && typeof bootstrap !== 'undefined') {
                bootstrap.Modal.getOrCreateInstance(modal).show();
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Failed to load interventions', 'error');
        }
    }
}

/**
 * Prepare Output Modal
 */
async function prepareOutputModal(spInterventionId) {
    const select = document.getElementById('output_select');
    const hiddenInput = document.getElementById('modal_output_intervention_id');
    
    if (hiddenInput) hiddenInput.value = spInterventionId;
    if (select) {
        select.innerHTML = '<option>Loading...</option>';
        
        try {
            const res = await fetch(`/mda/api/library/outputs-by-intervention/${spInterventionId}`);
            const data = await res.json();
            select.innerHTML = '<option value="">-- Select Output --</option>';
            data.forEach(o => {
                select.appendChild(new Option(`${o.output_code || ''} ${o.output_name || o.output}`, o.id));
            });
            
            const modal = document.getElementById('outputModal');
            if (modal && typeof bootstrap !== 'undefined') {
                bootstrap.Modal.getOrCreateInstance(modal).show();
            }
        } catch (e) {
            console.error(e);
            Swal.fire('Error', 'Failed to load outputs', 'error');
        }
    }
}

/**
 * Prepare Action Modal
 */
async function prepareActionModal(spOutputId, existingData = null) {
    if (!spOutputId) {
        console.error('prepareActionModal: No spOutputId provided');
        return;
    }
    
    const modalEl = document.getElementById('actionModal');
    const form = document.getElementById('actionForm');
    const select = document.getElementById('action_select');
    
    if (!modalEl || !form) {
        console.error('Action modal or form not found');
        return;
    }
    
    // UI Elements
    const customToggle = document.getElementById('action_custom_toggle');
    const libBox = document.getElementById('action_library_container');
    const custBox = document.getElementById('action_custom_container');
    const adaptToggle = document.getElementById('action_adapt_toggle');
    const adaptContainer = document.getElementById('action_adaptation_container');
    const customNameInput = document.getElementById('action_custom_name');
    
    // Reset form
    form.reset();
    const outputIdField = document.getElementById('modal_action_output_id');
    if (outputIdField) outputIdField.value = spOutputId;
    
    const totalDisplay = document.getElementById('action_total_display');
    if (totalDisplay) totalDisplay.textContent = '0';
    
    // Default UI state: Library mode
    if (libBox && custBox) {
        libBox.style.display = 'block';
        custBox.style.display = 'none';
    }
    
    if (customToggle) customToggle.checked = false;
    if (adaptToggle) adaptToggle.checked = false;
    if (adaptContainer) adaptContainer.style.display = 'none';
    
    // Clear dynamic inputs
    if (form) {
        form.querySelectorAll('input[name^="budgets["]').forEach(i => i.value = '');
    }
    
    if (select) {
        select.innerHTML = '<option>Loading...</option>';
        
        try {
            const res = await fetch(`/mda/api/library/actions-by-output/${spOutputId}`);
            const actions = await res.json();
            
            select.innerHTML = '<option value="">-- Select Action --</option>';
            actions.forEach(a => {
                select.appendChild(new Option(`${a.actionCode || ''} ${a.action}`, a.id));
            });
            
            // Populate existing data if in edit mode
            if (existingData && existingData.id) {
                const idField = form.querySelector('[name="id"]');
                if (idField) idField.value = existingData.id;
                
                const isCustom = !existingData.outputActionId;
                
                if (customToggle) {
                    customToggle.checked = isCustom;
                    // Trigger change event to update UI
                    customToggle.dispatchEvent(new Event('change', { bubbles: true }));
                }
                
                if (isCustom && customNameInput) {
                    customNameInput.value = existingData.adaptedOutputAction || '';
                } else if (select) {
                    select.value = existingData.outputActionId || '';
                    
                    // Handle adaptation
                    const adaptContent = existingData.adaptedOutputAction;
                    if (adaptContent && adaptContent !== '0' && adaptContent !== '') {
                        if (adaptToggle) adaptToggle.checked = true;
                        if (adaptContainer) adaptContainer.style.display = 'block';
                        const adaptTextarea = form.querySelector('[name="adaptedOutputAction"]');
                        if (adaptTextarea) adaptTextarea.value = adaptContent;
                    }
                }
                
                // Populate common fields
                const officeField = form.querySelector('[name="responsibleOfficeId"]');
                if (officeField && existingData.responsibleOfficeId) {
                    officeField.value = existingData.responsibleOfficeId;
                }
                
                const budgetSourceField = form.querySelector('[name="budgetSourceId"]');
                if (budgetSourceField && existingData.budgetSourceId) {
                    budgetSourceField.value = existingData.budgetSourceId;
                }
                
                // Populate budgets
                if (existingData.Budgets) {
                    existingData.Budgets.forEach(b => {
                        const input = form.querySelector(`[name="budgets[${b.fy}]"]`);
                        if (input) input.value = formatCurrency(b.val);
                    });
                    
                    // Update total
                    let total = 0;
                    form.querySelectorAll('input[data-type="currency"]').forEach(input => {
                        total += parseFloat(input.value.replace(/,/g, '')) || 0;
                    });
                    if (totalDisplay) totalDisplay.textContent = total.toLocaleString('en-US');
                }
            }
            
            if (typeof bootstrap !== 'undefined') {
                bootstrap.Modal.getOrCreateInstance(modalEl).show();
            }
        } catch (err) {
            console.error("Action Modal Error:", err);
            Swal.fire('Error', 'Error loading implementation actions', 'error');
        }
    }
}

// ============================================
// 4. INDICATOR MODAL FUNCTIONS
// ============================================

/**
 * Unified function to prepare and show Indicator Modals
 */
async function prepareIndicatorModal(level, parentId, existingData = null) {
    const lwr = level.toLowerCase();
    
    const config = {
        'outcome': {
            form: 'outcomeIndicatorForm', select: 'outcome_indicator_select', hidden: 'modal_outcome_parent_id',
            toggle: 'outcome_adapt_toggle', container: 'outcome_adaptation_container', customToggle: 'outcome_custom_toggle',
            libContainer: 'outcome_library_container', custContainer: 'outcome_custom_container',
            api: `/mda/api/library-indicators-by-outcome/${parentId}`, adaptField: 'adaptedOutcomeIndicator',
            indIdField: 'outcomeIndicatorId', natAlias: 'OutcomeNational'
        },
        'intermediate': {
            form: 'intIndicatorForm', select: 'intermediate_indicator_select', hidden: 'modal_intermediate_parent_id',
            toggle: 'int_adapt_toggle', container: 'int_adaptation_container', customToggle: 'int_custom_toggle',
            libContainer: 'int_library_container', custContainer: 'int_custom_container',
            api: `/mda/api/library/intermediate-indicators/${parentId}`, adaptField: 'adaptedIntermediateOutcomeIndicator',
            indIdField: 'intermediateOutcomeIndicatorId', natAlias: 'IntermediateNational'
        },
        'output': {
            form: 'outputIndicatorForm', select: 'output_indicator_select', hidden: 'modal_output_parent_id',
            toggle: 'output_adapt_toggle', container: 'output_adaptation_container', customToggle: 'output_custom_toggle',
            libContainer: 'output_library_container', custContainer: 'output_custom_container',
            api: `/mda/api/library/output-indicators/${parentId}`, adaptField: 'adaptedOutputIndicator',
            indIdField: 'outputIndicatorId', natAlias: 'OutputNational'
        }
    }[lwr];
    
    if (!config) {
        console.error(`No config found for level: ${lwr}`);
        return;
    }
    
    const form = document.getElementById(config.form);
    if (!form) {
        console.error(`Form not found: ${config.form}`);
        return;
    }
    
    // Reset form
    form.reset();
    const idField = form.querySelector('[name="id"]');
    if (idField) idField.value = '';
    
    const hiddenParent = document.getElementById(config.hidden);
    if (hiddenParent) hiddenParent.value = parentId;
    
    // Reset UI elements
    const adaptContainer = document.getElementById(config.container);
    if (adaptContainer) adaptContainer.style.display = 'none';
    
    const selectEl = document.getElementById(config.select);
    const customToggle = document.getElementById(config.customToggle);
    const libBox = document.getElementById(config.libContainer);
    const custBox = document.getElementById(config.custContainer);
    const customUnitSelect = form.querySelector('[name="customUnit"]');
    
    // Default UI: Library mode
    if (customToggle) customToggle.checked = false;
    if (libBox) libBox.style.display = 'block';
    if (custBox) custBox.style.display = 'none';
    if (selectEl) {
        selectEl.setAttribute('required', 'required');
        selectEl.innerHTML = '<option value="">-- Loading Indicators... --</option>';
    }
    
    // Setup custom toggle handler
    const syncCustomUI = () => {
        const isCustom = customToggle ? customToggle.checked : false;
        if (libBox) libBox.style.display = isCustom ? 'none' : 'block';
        if (custBox) custBox.style.display = isCustom ? 'block' : 'none';
        
        if (isCustom) {
            if (selectEl) {
                selectEl.removeAttribute('required');
                selectEl.value = "";
            }
            updateNationalReference(form, null, config.natAlias);
            const unitVal = customUnitSelect ? customUnitSelect.value : '---';
            updateUnitLabels(form, unitVal);
        } else {
            if (selectEl) selectEl.setAttribute('required', 'required');
            updateUnitLabels(form, '---');
        }
    };
    
    if (customToggle) {
        customToggle.onchange = syncCustomUI;
    }
    
    if (customUnitSelect) {
        customUnitSelect.onchange = () => {
            if (customToggle && customToggle.checked) {
                const unitVal = customUnitSelect.value || '---';
                updateUnitLabels(form, unitVal);
            }
        };
    }
    
    try {
        const res = await fetch(config.api);
        const indicators = await res.json();
        
        if (selectEl) {
            selectEl.innerHTML = '<option value="">-- Select Indicator --</option>';
            indicators.forEach(ind => {
                const text = ind.indicator || ind.indicatorName || ind.intermediate_outcome_indicator || ind.output_indicator;
                selectEl.appendChild(new Option(text, ind.id));
            });
            
            selectEl.onchange = function() {
                    const ind = indicators.find(i => i.id == this.value);
                    if (ind) {
                        // Get unit from the nested National object
                        const nationalData = ind[config.natAlias]; // e.g., ind.OutcomeNational
                        const unitValue = nationalData?.unit_of_measure || 
                                         ind.unit_of_measure || 
                                         ind.unit || 
                                         '---';
                        
                        updateNationalReference(form, ind, config.natAlias);
                        updateUnitLabels(form, unitValue);
                        
                        // Also update the unit badge
                        const unitBadge = document.getElementById(config.unitBadgeId);
                        if (unitBadge) {
                            unitBadge.textContent = `Unit: ${unitValue}`;
                        }
                        
                        console.log('Selected indicator:', ind.indicator);
                        console.log('Unit from national data:', unitValue);
                        console.log('Full national data:', nationalData);
                    }
                };
        }
        
        // Populate existing data if in edit mode
        if (existingData && existingData.id) {
            if (idField) idField.value = existingData.id;
            
            const isCustom = !existingData[config.indIdField];
            
            if (customToggle) {
                customToggle.checked = isCustom;
                syncCustomUI();
            }
            
            if (isCustom) {
                const custNameInput = form.querySelector('[name="customIndicatorName"]');
                if (custNameInput) custNameInput.value = existingData[config.adaptField] || '';
                
                const unitVal = existingData.unit_of_measure || existingData.unit || '';
                if (customUnitSelect) customUnitSelect.value = unitVal;
                updateUnitLabels(form, unitVal || '---');
            } else {
                if (selectEl) {
                    selectEl.value = existingData[config.indIdField];
                    const selectedInd = indicators.find(i => i.id == selectEl.value);
                    updateNationalReference(form, selectedInd, config.natAlias);
                    updateUnitLabels(form, selectedInd?.unit || '---');
                }
                
                const adaptText = existingData[config.adaptField];
                if (adaptText && adaptText.trim() !== "") {
                    const adaptToggleEl = document.getElementById(config.toggle);
                    if (adaptToggleEl) {
                        adaptToggleEl.checked = true;
                        if (adaptContainer) adaptContainer.style.display = 'block';
                        const textarea = form.querySelector(`textarea[name="${config.adaptField}"]`);
                        if (textarea) textarea.value = adaptText;
                    }
                }
            }
            
            // Populate common fields
            const baselineField = form.querySelector('[name="baselineValue"]');
            if (baselineField) baselineField.value = existingData.baseline_value || existingData.baselineValue || '';
            
            const officeField = form.querySelector('[name="responsibleOfficeId"]');
            if (officeField) officeField.value = existingData.responsible_office_id || existingData.responsibleOfficeId || '';
            
            const dataSourceField = form.querySelector('[name="dataSource"]');
            if (dataSourceField) dataSourceField.value = existingData.data_source || existingData.dataSource || '';
            
            // Populate targets
            const targetList = existingData.SelectedTargets || existingData.Targets || [];
            targetList.forEach(t => {
                const targetInput = form.querySelector(`input[name="targets[${t.fy}]"]`);
                if (targetInput) targetInput.value = (t.val !== null) ? t.val : '';
            });
        }
        
        // Show modal
        const modalEl = form.closest('.modal');
        if (modalEl && typeof bootstrap !== 'undefined') {
            bootstrap.Modal.getOrCreateInstance(modalEl).show();
        }
    } catch (err) {
        console.error("Modal Prep Error:", err);
        Swal.fire('Error', 'Failed to load indicators', 'error');
    }
}

/**
 * Edit existing indicator
 */
async function editIndicator(level, id) {
    const lwr = level.toLowerCase();
    const prefix = lwr === 'intermediate' ? 'int' : (lwr === 'outcome' ? 'outcome' : 'output');
    
    const config = {
        'outcome': {
            modal: 'outcomeIndicatorModal', 
            form: 'outcomeIndicatorForm', 
            select: 'outcome_indicator_select',
            parentIdField: 'spOutcomeId', 
            adaptField: 'adaptedOutcomeIndicator',
            libraryIdField: 'outcomeIndicatorId',
            customNameField: 'customIndicatorName',
            customUnitField: 'customUnit',
            natAlias: 'OutcomeNational',
            unitBadgeId: 'outcome_unit_badge',
            nationalPrefix: 'nat_val_',
            fetchUrl: (pid) => `/mda/api/library-indicators-by-outcome/${pid}`
        },
        'intermediate': {
            modal: 'intermediateIndicatorModal', 
            form: 'intIndicatorForm', 
            select: 'intermediate_indicator_select',
            parentIdField: 'spIntermediateOutcomeId', 
            adaptField: 'adaptedIntermediateOutcomeIndicator',
            libraryIdField: 'intermediateOutcomeIndicatorId',
            customNameField: 'customIndicatorName',
            customUnitField: 'customUnit',
            natAlias: 'IntermediateNational',
            unitBadgeId: 'int_unit_badge',
            nationalPrefix: 'nat_val_',
            fetchUrl: (pid) => `/mda/api/library/intermediate-indicators/${pid}`
        },
        'output': {
            modal: 'outputIndicatorModal', 
            form: 'outputIndicatorForm', 
            select: 'output_indicator_select',
            parentIdField: 'spOutputId', 
            adaptField: 'adaptedOutputIndicator',
            libraryIdField: 'outputIndicatorId',
            customNameField: 'customIndicatorName',
            customUnitField: 'customUnit',
            natAlias: 'OutputNational',
            unitBadgeId: 'out_unit_badge',
            nationalPrefix: 'out_nat_val_',
            fetchUrl: (pid) => `/mda/api/library/output-indicators/${pid}`
        }
    }[lwr];
    
    if (!config) {
        console.error(`No config found for level: ${lwr}`);
        Swal.fire('Error', `Invalid indicator level: ${level}`, 'error');
        return;
    }
    
    try {
        Swal.fire({
            title: 'Loading...',
            text: 'Fetching indicator details',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });
        
        const res = await fetch(`/mda/api/plan/indicator-details/${lwr}/${id}`);
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        const form = document.getElementById(config.form);
        
        if (!form) {
            throw new Error(`Form not found: ${config.form}`);
        }
        
        Swal.close();
        
        // Reset form
        form.reset();
        
        // Populate IDs
        const idField = form.querySelector('[name="id"]');
        if (idField) idField.value = id;
        
        const parentId = data[config.parentIdField];
        const parentInput = form.querySelector(`[name="${config.parentIdField}"]`);
        if (parentInput && parentId) parentInput.value = parentId;
        
        // Handle custom toggle
        const selectedLibraryId = data[config.libraryIdField];
        const isCustom = !selectedLibraryId || selectedLibraryId === null || selectedLibraryId === 'null';
        
        const customToggle = document.getElementById(`${prefix}_custom_toggle`);
        const libContainer = document.getElementById(`${prefix}_library_container`);
        const customContainer = document.getElementById(`${prefix}_custom_container`);
        const adaptToggle = document.getElementById(`${prefix}_adapt_toggle`);
        const adaptContainer = document.getElementById(`${prefix}_adaptation_container`);
        
        // Set custom toggle state
        if (customToggle) {
            customToggle.checked = isCustom;
            if (libContainer && customContainer) {
                libContainer.style.display = isCustom ? 'none' : 'block';
                customContainer.style.display = isCustom ? 'block' : 'none';
            }
            
            const selectEl = document.getElementById(config.select);
            const customNameInput = form.querySelector('[name="customIndicatorName"]');
            
            if (isCustom) {
                if (selectEl) selectEl.removeAttribute('required');
                if (customNameInput) customNameInput.setAttribute('required', 'required');
            } else {
                if (selectEl) selectEl.setAttribute('required', 'required');
                if (customNameInput) customNameInput.removeAttribute('required');
            }
        }
        
        // Populate data based on mode
        let unitValue = '---'; // Default unit
        
        if (isCustom) {
            // CUSTOM MODE - Get unit from the returned data
            const nameInput = form.querySelector('[name="customIndicatorName"]');
            const unitSelect = form.querySelector(`[name="${config.customUnitField}"]`);
            
            if (nameInput) {
                const customName = data[config.adaptField] || data.custom_indicator_name || data.indicator_name || '';
                nameInput.value = customName;
            }
            
            // Get unit from various possible locations
            unitValue = data.unitOfMeasure || data.unit_of_measure || data.unit || '';
            
            if (unitSelect) {
                unitSelect.value = unitValue;
            }
            
            console.log('Custom mode - Unit:', unitValue);
            
        } else {
            // LIBRARY MODE - Get unit from the nested national data
            if (parentId) {
                const listRes = await fetch(config.fetchUrl(parentId));
                if (!listRes.ok) throw new Error('Failed to load library indicators');
                
                const indicators = await listRes.json();
                const selectEl = document.getElementById(config.select);
                
                if (selectEl) {
                    selectEl.innerHTML = '<option value="">Select Indicator...</option>';
                    indicators.forEach(ind => {
                        const text = ind.indicator || ind.indicatorName || ind.intermediate_outcome_indicator || ind.output_indicator || ind.name;
                        selectEl.appendChild(new Option(text, ind.id));
                    });
                    
                    // Add onchange handler to update unit when selection changes
                    selectEl.onchange = function() {
                        const selectedInd = indicators.find(i => i.id == this.value);
                        if (selectedInd) {
                            // Get unit from the nested national data
                            const nationalData = selectedInd[config.natAlias];
                            const newUnitValue = nationalData?.unit_of_measure || 
                                                selectedInd.unit_of_measure || 
                                                selectedInd.unit || 
                                                '---';
                            
                            updateNationalReference(form, selectedInd, config.natAlias);
                            updateUnitLabels(form, newUnitValue);
                            
                            const badge = document.getElementById(config.unitBadgeId);
                            if (badge) badge.textContent = `Unit: ${newUnitValue}`;
                        }
                    };
                    
                    if (selectedLibraryId) {
                        selectEl.value = selectedLibraryId;
                        const selectedInd = indicators.find(i => i.id == selectedLibraryId);
                        if (selectedInd) {
                            // CRITICAL FIX: Get unit from the nested national data
                            const nationalData = selectedInd[config.natAlias];
                            unitValue = nationalData?.unit_of_measure || 
                                       selectedInd.unit_of_measure || 
                                       selectedInd.unit || 
                                       '';
                            
                            console.log('Library mode - Unit from nested data:', unitValue);
                            console.log('National data:', nationalData);
                            
                            updateNationalReference(form, selectedInd, config.natAlias);
                        }
                    }
                }
            }
            
            // Handle library adaptation
            const adaptText = data[config.adaptField];
            if (adaptToggle && adaptText && adaptText.trim() !== "" && adaptText !== '0') {
                adaptToggle.checked = true;
                if (adaptContainer) adaptContainer.style.display = 'block';
                const textarea = form.querySelector(`textarea[name="${config.adaptField}"]`);
                if (textarea) textarea.value = adaptText;
            } else if (adaptToggle) {
                adaptToggle.checked = false;
                if (adaptContainer) adaptContainer.style.display = 'none';
            }
        }
        
        // Update all unit displays with the retrieved unit value
        updateUnitLabels(form, unitValue);
        
        // Update unit badge specifically
        const unitBadge = document.getElementById(config.unitBadgeId);
        if (unitBadge) {
            const displayUnit = (unitValue && unitValue.trim()) ? unitValue.trim() : '---';
            unitBadge.textContent = `Unit: ${displayUnit}`;
        }
        
        // Populate common fields
        const baselineField = form.querySelector('[name="baselineValue"]');
        if (baselineField) {
            baselineField.value = data.baseline_value || data.baselineValue || '';
            if (baselineField.value && typeof formatCurrency === 'function') {
                baselineField.value = formatCurrency(baselineField.value);
            }
        }
        
        const officeField = form.querySelector('[name="responsibleOfficeId"]');
        if (officeField) {
            officeField.value = data.responsible_office_id || data.responsibleOfficeId || '';
        }
        
        const dataSourceField = form.querySelector('[name="dataSource"]');
        if (dataSourceField) {
            dataSourceField.value = data.data_source || data.dataSource || '';
        }
        
        // Populate targets
        const targetList = data.Targets || data.SelectedTargets || [];
        form.querySelectorAll('input[name^="targets["]').forEach(input => input.value = '');
        
        targetList.forEach(target => {
            const year = target.fy || target.target_year || target.year;
            if (year) {
                const input = form.querySelector(`input[name="targets[${year}]"]`);
                if (input && target.val !== null && target.val !== undefined) {
                    let value = target.val;
                    if (typeof value === 'number' && typeof formatCurrency === 'function') {
                        value = formatCurrency(value);
                    }
                    input.value = value;
                }
            }
        });
        
        // Show modal
        const modalEl = document.getElementById(config.modal);
        if (modalEl) {
            if (typeof bootstrap !== 'undefined') {
                const existingModal = bootstrap.Modal.getInstance(modalEl);
                if (existingModal) {
                    existingModal.dispose();
                }
                const modal = new bootstrap.Modal(modalEl, {
                    backdrop: 'static',
                    keyboard: false
                });
                modal.show();
            } else {
                modalEl.style.display = 'block';
                modalEl.classList.add('show');
                document.body.classList.add('modal-open');
                const backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop fade show';
                document.body.appendChild(backdrop);
            }
        } else {
            throw new Error(`Modal element not found: ${config.modal}`);
        }
        
    } catch (err) {
        console.error("Edit Indicator Error:", err);
        Swal.fire({
            title: 'Error',
            text: err.message || 'Failed to load indicator details',
            icon: 'error'
        });
    }
}

function updateUnitLabels(form, unitText) {
    if (!form) return;
    const displayUnit = (unitText && unitText.trim()) ? unitText.trim() : '---';
    
    // Update all span elements with these classes
    form.querySelectorAll('.unit-append, .unit-label, .unit-badge').forEach(span => {
        if (span) span.innerText = displayUnit;
    });
    
    // Also update any spans that are direct children of input groups
    form.querySelectorAll('.input-group-text.bg-light.small, .input-group-text.x-small').forEach(span => {
        if (span && span.classList.contains('unit-append') === false) {
            // Only update if it doesn't have unit-append class (to avoid double update)
            span.innerText = displayUnit;
        }
    });
}

// ============================================
// 5. DELETE FUNCTIONS
// ============================================

const removeObjective = (id) => confirmDelete(`/mda/plans/objectives/${id}`, "Warning: This will remove the objective and ALL associated outcomes, indicators, and outputs!");
const removeOutcome = (id) => confirmDelete(`/mda/api/plan/outcome/${id}`, "Warning: This deletes all linked indicators, intermediates, and interventions.");
const removeIntermediate = (id) => confirmDelete(`/mda/api/plan/intermediate/${id}`);
const removeIntervention = (id) => confirmDelete(`/mda/api/plan/intervention/${id}`);
const deleteOutput = (id) => confirmDelete(`/mda/api/plan/delete-output/${id}`);
const deleteAction = (id) => confirmDelete(`/mda/api/plan/delete-output-action/${id}`);

const removeIndicator = (level, id) => {
    const url = `/mda/api/plan/remove-indicator/${level}/${id}`;
    confirmDelete(url, `This will remove the ${level} indicator and all its associated targets.`);
};

// ============================================
// 6. SUBMIT TO NPA FUNCTION
// ============================================

async function submitToNPA(planId) {
    const result = await Swal.fire({
        title: 'Submit to NPA?',
        text: "This will lock the plan and notify the National Planning Authority. You won't be able to undo this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#198754',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, Submit Plan',
        cancelButtonText: 'Wait, go back'
    });
    
    if (result.isConfirmed) {
        Swal.fire({
            title: 'Submitting...',
            text: 'Please wait while we finalize your framework.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });
        
        try {
            const response = await fetch(`/mda/plans/${planId}/submit-npa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                await Swal.fire({
                    title: 'Success!',
                    text: 'Your Strategic Plan has been submitted to NPA.',
                    icon: 'success'
                });
                window.location.href = '/mda/plans';
            } else {
                throw new Error(data.message || 'Submission failed');
            }
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: error.message,
                icon: 'error'
            });
        }
    }
}