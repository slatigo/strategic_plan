/**
 * Strategic Plan Editor JS - Unified Final Version
 * Handles Objectives, Outcomes, Intermediates, Interventions, Outputs, and Actions
 */
document.getElementById('objectiveForm').addEventListener('submit', async (e) => {
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
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GLOBAL UI TOGGLES (Adaptation Logic) ---
    // This looks for any checkbox with class 'adapt-toggle' and shows/hides its specific container
    document.addEventListener('change', (e) => {
        if (e.target && e.target.classList.contains('adapt-toggle')) {

            const containerId = e.target.getAttribute('data-target-container');
            const container = document.getElementById(containerId);
            if (container) {
                container.style.display = e.target.checked ? 'block' : 'none';
            }
        }
    });

    // --- 2. UNIFIED INDICATOR FORM SUBMISSION ---
    // Handles Outcome, Intermediate, and Output indicators in one logic block
    // --- 2. UNIFIED INDICATOR FORM SUBMISSION ---
    const indicatorForms = ['outcomeIndicatorForm', 'intIndicatorForm', 'outputIndicatorForm'];
    indicatorForms.forEach(formId => {
        const form = document.getElementById(formId);
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const payload = Object.fromEntries(formData.entries());

            // A. CLEANUP IDs: Convert empty strings to null
            // This is why "Add" fails: the DB sees an empty string for an integer field
            const idFields = [
                'id', 
                'spOutcomeId', 
                'spIntermediateOutcomeId', 
                'spOutputId', 
                'outcomeIndicatorId', 
                'intermediateOutcomeIndicatorId', 
                'outputIndicatorId',
                'responsibleOfficeId'
            ];
            idFields.forEach(field => {
                if (payload[field] === '') payload[field] = null;
            });

            // B. REMOVE PLAN ID: We agreed to remove this column from indicators
            delete payload.planId; 

            // C. Handle Adaptation Cleanup
            const isAdapted = e.target.querySelector('.adapt-toggle')?.checked;
            if (!isAdapted) {
                const levelName = formId.replace('IndicatorForm', '').replace('int', 'Intermediate');
                const fieldName = `adapted${levelName.charAt(0).toUpperCase() + levelName.slice(1)}Indicator`;
                payload[fieldName] = null; 
            }

            // D. Capture yearly targets
            payload.targets = {};
            for (let [key, value] of formData.entries()) {
                if (key.startsWith('targets[')) {
                    const year = key.match(/\d+/)?.[0];
                    if (year) {
                        payload.targets[year] = value;
                        delete payload[key];
                    }
                }
            }

            const endpointMap = {
                'outcomeIndicatorForm': '/mda/plans/indicators/save',
                'intIndicatorForm': '/mda/api/plan/save-int-indicator',
                'outputIndicatorForm': '/mda/api/plan/save-output-indicator'
            };

            try {
                const res = await fetch(endpointMap[formId], {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (result.status === 'success' || result.success) {
                    Swal.fire('Saved', 'Indicator updated successfully', 'success').then(() => location.reload());
                } else {
                    Swal.fire('Error', result.message, 'error');
                }
            } catch (err) {
                Swal.fire('Error', 'Server communication failure', 'error');
            }
        });
    });

    // --- 3. OTHER FORM HANDLERS (Objectives, Intermediates, Interventions) ---
    const otherForms = [
        { id: 'intermediateForm', url: '/mda/api/plan/save-intermediate' },
        { id: 'interventionForm', url: '/mda/api/plan/save-intervention' },
        { id: 'outputForm', url: '/mda/api/plan/save-output' },
       
    ];

    otherForms.forEach(cfg => {
        const formEl = document.getElementById(cfg.id);
        if (!formEl) return;
        
        formEl.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formEl);
            const payload = Object.fromEntries(formData.entries());

            // 1. CLEANUP: Remove planId because we dropped the column
            delete payload.planId;

            // 2. SAFETY: Convert empty ID strings to null for the DB
            // List common ID fields used across these three forms
            const idFields = ['spOutcomeId', 'spIntermediateOutcomeId', 'spInterventionId', 'libraryIntId', 'libraryInterventionId', 'libraryOutputId'];
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
                    location.reload();
                } else {
                    Swal.fire('Error', result.message, 'error');
                }
            } catch (err) { 
                console.error(err);
                Swal.fire('Error', 'Connection failed', 'error');
            }
        });
    });
});

// --- GLOBAL HELPERS (Accessible via Pug onclick) ---

async function prepareOutcomeModal(spObjectiveId, libraryObjectiveId, objName) {
    const hiddenInput = document.getElementById('modal_sp_objective_id');
    const displayObj = document.getElementById('display_obj_name');
    const select = document.getElementById('outcome_library_id');

    // REMOVE the 'return' before console.log so the function continues
   

    if (hiddenInput) hiddenInput.value = spObjectiveId;
    if (displayObj) displayObj.innerText = objName;

    try {
        // FIX: Added &spObjectiveId=${spObjectiveId} to the query string
        const res = await fetch(`/mda/api/library-outcomes?objectiveId=${libraryObjectiveId}&spObjectiveId=${spObjectiveId}`);
        
        const outcomes = await res.json();
        
        select.innerHTML = '<option value="" disabled selected>-- Select Outcome --</option>';
        outcomes.forEach(o => {
            select.appendChild(new Option(`${o.outcomeCode}: ${o.outcomeName}`, o.id));
        });

        bootstrap.Modal.getOrCreateInstance(document.getElementById('addOutcomeModal')).show();
    } catch (err) { 
        console.error(err);
        Swal.fire('Error', 'Failed to load outcomes', 'error'); 
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('saveOutcomeBtn');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const spObjectiveId = document.getElementById('modal_sp_objective_id').value;
            const outcomeId = document.getElementById('outcome_library_id').value;

            if (!outcomeId) {
                return Swal.fire('Wait!', 'Please select an outcome first.', 'warning');
            }

            // --- Start Loading State ---
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

                // Check for 'success' status to match your controller
                if (result.status === 'success') {
                    // Show a quick toast before reloading
                    Swal.fire({
                        icon: 'success',
                        title: 'Linked!',
                        text: 'Outcome has been added.',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.reload();
                    });
                } else {
                    // Logic for handled errors (like duplicates)
                    Swal.fire('Error', result.message || 'Failed to save', 'error');
                    // Reset button if there was a user error
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = originalText;
                }
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'Server communication failed', 'error');
                // Reset button on crash
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalText;
            }
        });
    }
});
async function deleteOutcome(spOutcomeId) {
    const result = await Swal.fire({
        title: 'Remove Outcome?',
        text: "This will also remove any indicators attached to this outcome.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, remove it'
    });

    if (result.isConfirmed) {
        try {
            // This matches your router: /api/plan/outcome/:id
            const response = await fetch(`/mda/api/plan/outcome/${spOutcomeId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.status === 'success') {
                Swal.fire('Removed!', 'Outcome has been unlinked.', 'success')
                    .then(() => window.location.reload());
            } else {
                Swal.fire('Error', data.message || 'Could not remove', 'error');
            }
        } catch (err) {
            Swal.fire('Error', 'Communication with server failed', 'error');
        }
    }
}
async function prepareIntermediateModal(spOutcomeId) {
    const select = document.getElementById('libraryIntSelect');
    const hiddenIdInput = document.getElementById('modal_parent_outcome_id');
    
    if (hiddenIdInput) hiddenIdInput.value = spOutcomeId;
    select.innerHTML = '<option>Loading...</option>';

    try {
        const res = await fetch(`/mda/api/library/intermediate-outcomes/${spOutcomeId}`);
        const data = await res.json();
        select.innerHTML = '<option value="">-- Select Intermediate Outcome --</option>';
        data.forEach(item => {
            select.appendChild(new Option(item.intermediateOutcome, item.id));
        });
        bootstrap.Modal.getOrCreateInstance(document.getElementById('addIntermediateModal')).show();
    } catch (err) { console.error(err); }
}

async function prepareInterventionModal(parentId) {
    const select = document.getElementById('libraryInvSelect');
    document.getElementById('modal_sp_int_parent_id').value = parentId;
    select.innerHTML = '<option>Loading...</option>';

    try {
        const res = await fetch(`/mda/api/library/interventions/${parentId}`);
        const data = await res.json();
        select.innerHTML = '<option value="">-- Select Intervention --</option>';
        data.forEach(item => {
            select.appendChild(new Option(item.intervention, item.id));
        });
        bootstrap.Modal.getOrCreateInstance(document.getElementById('addInterventionModal')).show();
    } catch (err) { console.error(err); }
}

async function prepareOutputModal(spInterventionId) {
    const select = document.getElementById('output_select');
    document.getElementById('modal_output_intervention_id').value = spInterventionId;
    select.innerHTML = '<option>Loading...</option>';

    try {
        const res = await fetch(`/mda/api/library/outputs-by-intervention/${spInterventionId}`);
        const data = await res.json();
        select.innerHTML = '<option value="">-- Select Output --</option>';
        data.forEach(o => {
            select.appendChild(new Option(`${o.output_code || ''} ${o.output_name || o.output}`, o.id));
        });
        bootstrap.Modal.getOrCreateInstance(document.getElementById('outputModal')).show();
    } catch (e) { console.error(e); }
}

/**
 * Formats a number with commas for UGX display
 */
const formatUGX = (val) => {
    const num = parseFloat(String(val).replace(/,/g, ''));
    return isNaN(num) ? "" : num.toLocaleString('en-US');
};

/**
 * Updates the cumulative total display in the modal
 */
const updateActionTotal = () => {
    let total = 0;
    document.querySelectorAll('#actionForm input[data-type="currency"]').forEach(input => {
        const val = parseFloat(input.value.replace(/,/g, '')) || 0;
        total += val;
    });
    const display = document.getElementById('action_total_display');
    if (display) display.textContent = total.toLocaleString('en-US');
};

// --- UTILITIES ---
const formatCurrency = (val) => {
    const num = parseFloat(String(val).replace(/,/g, ''));
    return isNaN(num) ? "" : num.toLocaleString('en-US');
};

const updateActionGrandTotal = () => {
    let total = 0;
    document.querySelectorAll('#actionForm input[data-type="currency"]').forEach(input => {
        total += parseFloat(input.value.replace(/,/g, '')) || 0;
    });
    const display = document.getElementById('action_total_display');
    if (display) display.textContent = total.toLocaleString('en-US');
};

// --- MODAL PREPARATION ---
async function prepareActionModal(spOutputId, existingData = null) {
    const modalEl = document.getElementById('actionModal');
    const form = document.getElementById('actionForm');
    const select = document.getElementById('action_select');
    
    form.reset();
    document.getElementById('modal_action_output_id').value = spOutputId;
    document.getElementById('action_total_display').textContent = '0';
    
    // Clear dynamic inputs
    form.querySelectorAll('input[name^="budgets["]').forEach(i => i.value = '');
    select.innerHTML = '<option>Loading...</option>';

    try {
        const res = await fetch(`/mda/api/library/actions-by-output/${spOutputId}`);
        const actions = await res.json();
        
        select.innerHTML = '<option value="">-- Select Action --</option>';
        actions.forEach(a => {
            select.appendChild(new Option(`${a.actionCode || ''} ${a.action}`, a.id));
        });

        if (existingData) {
            form.querySelector('[name="id"]').value = existingData.id || '';
            select.value = existingData.outputActionId || '';
            
            if (existingData.responsibleOfficeId) 
                form.querySelector('[name="responsibleOfficeId"]').value = existingData.responsibleOfficeId;
            if (existingData.budgetSourceId) 
                form.querySelector('[name="budgetSourceId"]').value = existingData.budgetSourceId;

            // Adaptation Toggle
            const adaptToggle = document.getElementById('action_adapt_toggle');
            const adaptContainer = document.getElementById('action_adaptation_container');
            if (existingData.adaptedOutputAction) {
                adaptToggle.checked = true;
                adaptContainer.style.display = 'block';
                form.querySelector('[name="adaptedOutputAction"]').value = existingData.adaptedOutputAction;
            }

            // Populate Budgets with formatting
            if (existingData.Budgets) {
                existingData.Budgets.forEach(b => {
                    const input = form.querySelector(`[name="budgets[${b.fy}]"]`);
                    if (input) input.value = formatCurrency(b.val);
                });
                updateActionGrandTotal();
            }
        }
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
    } catch (e) { alert("Error loading data"); }
}

// --- LIVE INTERACTION ---
document.addEventListener('input', (e) => {
    if (e.target.matches('#actionForm input[data-type="currency"]')) {
        e.target.value = formatCurrency(e.target.value);
        updateActionGrandTotal();
    }
});

// --- SUBMISSION WITH CLEANING ---
document.getElementById('actionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = document.querySelector('button[form="actionForm"]');
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

    const payload = {
        id: formData.get('id') || null,
        spOutputId: formData.get('spOutputId'),
        outputActionId: formData.get('outputActionId'),
        responsibleOfficeId: formData.get('responsibleOfficeId'),
        budgetSourceId: formData.get('budgetSourceId'),
        adaptedOutputAction: document.getElementById('action_adapt_toggle').checked 
            ? formData.get('adaptedOutputAction') : null,
        budgets: {}
    };

    // Robust Regex to handle,2025 or any browser noise
    for (let [key, value] of formData.entries()) {
        if (key.includes('budgets[')) {
            const yearMatch = key.match(/\d+/); // Grabs only the first number (the year)
            if (yearMatch && value.trim() !== '') {
                payload.budgets[yearMatch] = value.replace(/,/g, '').trim();
            }
        }
    }

    try {
        const response = await fetch('/mda/api/plan/save-output-action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.status === 'success') location.reload();
        else throw new Error(result.message);
    } catch (error) {
        alert('Save failed: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Save Action & Budget';
    }
});
// --- DELETE UTILITIES ---

async function confirmDelete(url, text = "This cannot be undone.") {
    const res = await Swal.fire({
        title: 'Are you sure?',
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it'
    });
    if (res.isConfirmed) {
        const response = await fetch(url, { method: 'DELETE' });
        const data = await response.json();
        if (data.status === 'success' || data.success) location.reload();
        else Swal.fire('Error', data.message, 'error');
    }
}

// Map the Pug calls to the unified delete helper
const removeObjective = (id) => confirmDelete(`/mda/plans/objectives/${id}`, "Warning: This will remove the objective and ALL associated outcomes, indicators, and outputs!");
const removeOutcome = (id) => confirmDelete(`/mda/api/plan/outcome/${id}`, "Warning: This deletes all linked indicators, intermediates, and interventions.");
const removeIntermediate = (id) => confirmDelete(`/mda/api/plan/intermediate/${id}`);
const removeIntervention = (id) => confirmDelete(`/mda/api/plan/intervention/${id}`);
const deleteOutput = (id) => confirmDelete(`/mda/api/plan/delete-output/${id}`);
const deleteAction = (id) => confirmDelete(`/mda/api/plan/delete-output-action/${id}`);



const removeIndicator = (level, id) => {
    // Construct the URL to match: router.delete('/api/plan/remove-indicator/:level/:id'...)
    const url = `/mda/api/plan/remove-indicator/${level}/${id}`;
    
    confirmDelete(url, `This will remove the ${level} indicator and all its associated targets.`);
};
async function prepareIndicatorModal(level, parentId, existingData = null) {

    const lwr = level.toLowerCase();
    const config = {
        'outcome': { 
            modal: 'outcomeIndicatorModal', form: 'outcomeIndicatorForm', select: 'outcome_indicator_select', 
            hidden: 'modal_outcome_parent_id', toggle: 'outcome_adapt_toggle', container: 'outcome_adaptation_container', 
            api: `/mda/api/library-indicators-by-outcome/${parentId}`,
            adaptField: 'adaptedOutcomeIndicator', indIdField: 'outcomeIndicatorId',
            natAlias: 'OutcomeNational' // Matches the 'as' in your controller
        },
        'intermediate': { 
            modal: 'intermediateIndicatorModal', form: 'intIndicatorForm', select: 'intermediate_indicator_select', 
            hidden: 'modal_intermediate_parent_id', toggle: 'int_adapt_toggle', container: 'int_adaptation_container', 
            api: `/mda/api/library/intermediate-indicators/${parentId}`,
            adaptField: 'adaptedIntermediateOutcomeIndicator', indIdField: 'intermediateOutcomeIndicatorId',
            natAlias: 'IntermediateNational'
        },
        'output': { 
            modal: 'outputIndicatorModal', form: 'outputIndicatorForm', select: 'output_indicator_select', 
            hidden: 'modal_output_parent_id', toggle: 'output_adapt_toggle', container: 'output_adaptation_container', 
            api: `/mda/api/library/output-indicators/${parentId}`,
            adaptField: 'adaptedOutputIndicator', indIdField: 'outputIndicatorId',
            natAlias: 'OutputNational'
        }
    }[lwr];

    const form = document.getElementById(config.form);

    if (!form) return;

    form.reset(); 
    if (form.querySelector('[name="id"]')) form.querySelector('[name="id"]').value = existingData?.id || '';
    document.getElementById(config.hidden).value = parentId;

    const selectEl = document.getElementById(config.select);
    selectEl.innerHTML = '<option>Loading indicators...</option>';
    
    bootstrap.Modal.getOrCreateInstance(document.getElementById(config.modal)).show();


    try {
        const res = await fetch(config.api);
        const indicators = await res.json();

        // Store indicators on the form element for easy access by the change listener
        form.dataset.indicators = JSON.stringify(indicators);

        selectEl.innerHTML = `<option value="">-- Select ${level} Indicator --</option>`;
        indicators.forEach(ind => {
            const text = ind.indicator || ind.indicatorName || ind.intermediate_outcome_indicator || ind.output_indicator;
            selectEl.appendChild(new Option(text, ind.id));
        });

        // --- NEW: THE CHANGE LISTENER ---
        selectEl.onchange = function() {
            const selectedId = this.value;
            const ind = indicators.find(i => i.id == selectedId);
            updateNationalReference(form, ind, config.natAlias);
        };

        if (existingData) {
            selectEl.value = existingData[config.indIdField];
            
            // Set basic fields
            if (form.querySelector('[name="baselineValue"]')) 
                form.querySelector('[name="baselineValue"]').value = existingData.baselineValue || '';
            if (form.querySelector('[name="responsibleOfficeId"]')) 
                form.querySelector('[name="responsibleOfficeId"]').value = existingData.responsibleOfficeId || '';
            if (form.querySelector('[name="dataSource"]')) 
                form.querySelector('[name="dataSource"]').value = existingData.dataSource || '';

            // Handle Adaptation logic (Keep as you had it)
            const adaptContent = existingData[config.adaptField];
            const toggle = document.getElementById(config.toggle);
            const container = document.getElementById(config.container);
            if (adaptContent) {
                toggle.checked = true;
                container.style.display = 'block';
                form.querySelector(`textarea[name="${config.adaptField}"]`).value = adaptContent;
            } else {
                toggle.checked = false;
                container.style.display = 'none';
            }

            // Populate Targets
            const targets = existingData.SelectedTargets || existingData.Targets || [];
            targets.forEach(t => {
                const targetInput = form.querySelector(`input[name="targets[${t.fy}]"]`);
                if (targetInput) targetInput.value = t.val;
            });

            // Trigger the National Reference update for the edit view
            const currentInd = indicators.find(i => i.id == selectEl.value);
            updateNationalReference(form, currentInd, config.natAlias);
        }

    } catch (err) {
        console.error("Indicator Load Error:", err);
        selectEl.innerHTML = '<option>Error loading library</option>';
    }
}

/**
 * Helper to update Units and NDP Targets in the modal
 */
/**
 * Updates Units, NDP Benchmarks, and Baseline styling in the active modal.
 * @param {HTMLFormElement} form - The current active form (Outcome, Int, or Output).
 * @param {Object} indicator - The full indicator object from the library API.
 * @param {String} alias - The alias string (e.g., 'OutcomeNational', 'IntermediateNational').
 */
function updateNationalReference(form, indicator, alias) {
    // 1. Extract Alignment data and Unit
    const align = indicator ? indicator[alias] : null;
    const rawUnit = align?.unit_of_measure || '';
    const unit = rawUnit.trim();
    const displayUnit = unit || '---';

    // 2. Determine Prefix (for Outcome, Intermediate, or Output IDs)
    let idPrefix = "";
    if (alias.toLowerCase().includes("intermediate")) idPrefix = "int_";
    if (alias.toLowerCase().includes("output")) idPrefix = "out_";

    // 3. Update Unit Badge and Input-Group Append (Suffix boxes)
    const badge = form.querySelector('[id$="_unit_badge"]');
    if (badge) badge.textContent = `Unit: ${displayUnit}`;
    
    form.querySelectorAll('.unit-append').forEach(el => {
        el.textContent = displayUnit;
    });

    // 4. Baseline Input Logic (Unlock and Placeholder)
    const baselineInput = form.querySelector('[name="baselineValue"]');
    if (baselineInput) {
        if (indicator) {
            baselineInput.removeAttribute('readonly');
            // Show unit in placeholder for clarity
            baselineInput.placeholder = unit ? `Enter baseline (${unit})...` : "0.00";
        } else {
            baselineInput.placeholder = "Wait for selection...";
            baselineInput.value = "";
            baselineInput.setAttribute('readonly', true);
        }
    }

    // 5. Update NDP Target Labels (The Blue Reference Row)
    // Clear old values first
    form.querySelectorAll(`[id^="${idPrefix}nat_val_"]`).forEach(el => el.textContent = '--');

    if (align && align.YearlyValues) {
        align.YearlyValues.forEach(nv => {
            const label = form.querySelector(`#${idPrefix}nat_val_${nv.target_year}`);
            if (label) {
                const formattedVal = nv.value ? nv.value.toLocaleString() : '0';
                
                // --- Formatting Logic ---
                const isCurrency = unit.toUpperCase() === 'UGX';
                const genericUnits = ['number', 'qty', 'count', 'quantity', '---', ''];
                const isGeneric = genericUnits.includes(unit.toLowerCase());

                if (isCurrency) {
                    // Financial Prefix
                    label.textContent = `UGX ${formattedVal}`; 
                } else if (isGeneric) {
                    // Clean Number (No unit text)
                    label.textContent = formattedVal; 
                } else {
                    // Standard Suffix (e.g., 85 %)
                    label.textContent = `${formattedVal} ${unit}`; 
                }
            }
        });
    }
}
async function editIndicator(level, id) {
    const lwr = level.toLowerCase();
    const config = {
        'outcome': { 
            modal: 'outcomeIndicatorModal', form: 'outcomeIndicatorForm', select: 'outcome_indicator_select',
            toggle: 'outcome_adapt_toggle', container: 'outcome_adaptation_container',
            parentIdField: 'spOutcomeId', adaptField: 'adaptedOutcomeIndicator',
            fetchUrl: (pid) => `/mda/api/library-indicators-by-outcome/${pid}`,
            natAlias: 'OutcomeNational' // ADD THIS
        },
        'intermediate': { 
            modal: 'intermediateIndicatorModal', form: 'intIndicatorForm', select: 'intermediate_indicator_select',
            toggle: 'int_adapt_toggle', container: 'int_adaptation_container',
            parentIdField: 'spIntermediateOutcomeId', adaptField: 'adaptedIntermediateOutcomeIndicator',
            fetchUrl: (pid) => `/mda/api/library/intermediate-indicators/${pid}`,
            natAlias: 'IntermediateNational' // ADD THIS
        },
        'output': { 
            modal: 'outputIndicatorModal', form: 'outputIndicatorForm', select: 'output_indicator_select',
            toggle: 'output_adapt_toggle', container: 'output_adaptation_container',
            parentIdField: 'spOutputId', adaptField: 'adaptedOutputIndicator',
            fetchUrl: (pid) => `/mda/api/library/output-indicators/${pid}`,
            natAlias: 'OutputNational' // ADD THIS
        }
    }[lwr];

    try {
        const res = await fetch(`/mda/api/plan/indicator-details/${lwr}/${id}`);
        const data = await res.json();
        const form = document.getElementById(config.form);

        // 1. Populate Parent ID
        const parentId = data[config.parentIdField];
        const parentIdInput = form.querySelector(`[name="${config.parentIdField}"]`);
        if (parentIdInput) parentIdInput.value = parentId || '';

        // 2. Fetch Library & Populate Dropdown
        if (parentId) {
            const listRes = await fetch(config.fetchUrl(parentId));
            const indicators = await listRes.json();
            
            // Store for the change listener (same as prepareModal)
            form.dataset.indicators = JSON.stringify(indicators);

            const selectEl = document.getElementById(config.select);
            selectEl.innerHTML = '<option value="">Select Indicator...</option>';
            
            indicators.forEach(ind => {
                const text = ind.indicator || ind.indicatorName || ind.intermediate_outcome_indicator || ind.output_indicator;
                selectEl.appendChild(new Option(text, ind.id));
            });

            // Set the current selection
            const selectedIndicatorId = data.outcomeIndicatorId || data.intermediateOutcomeIndicatorId || data.outputIndicatorId;
            selectEl.value = selectedIndicatorId;

            // --- THE NEW PART: Update Units & NDP Targets ---
            const currentInd = indicators.find(i => i.id == selectedIndicatorId);
            if (typeof updateNationalReference === 'function') {
                updateNationalReference(form, currentInd, config.natAlias);
            }

            // Re-bind the change listener so it works during the edit session
            selectEl.onchange = function() {
                const ind = indicators.find(i => i.id == this.value);
                updateNationalReference(form, ind, config.natAlias);
            };
        }

        // 3. Fill Basic Fields (Baseline, Office, Source)
        form.querySelector('[name="id"]').value = id;
        form.querySelector('[name="baselineValue"]').value = data.baselineValue || '';
        
        if (form.querySelector('[name="responsibleOfficeId"]')) 
            form.querySelector('[name="responsibleOfficeId"]').value = data.responsibleOfficeId || '';

        if (form.querySelector('[name="dataSource"]')) 
            form.querySelector('[name="dataSource"]').value = data.dataSource || '';

        // 4. Handle Adaptation Toggle
        const adaptText = data[config.adaptField];
        const toggle = document.getElementById(config.toggle);
        const container = document.getElementById(config.container);
        const textarea = form.querySelector('textarea');

        if (adaptText && adaptText !== '') {
            toggle.checked = true;
            container.style.display = 'block';
            if (textarea) textarea.value = adaptText;
        } else {
            toggle.checked = false;
            container.style.display = 'none';
        }

        // 5. Fill Yearly Targets
        form.querySelectorAll('input[name^="targets["]').forEach(input => input.value = '');
        const targetList = data.Targets || data.SelectedTargets || [];
        targetList.forEach(t => {
            const targetInput = form.querySelector(`[name="targets[${t.fy}]"]`);
            if (targetInput) targetInput.value = t.val;
        });

        bootstrap.Modal.getOrCreateInstance(document.getElementById(config.modal)).show();
    } catch (err) {
        console.error("Edit Load Error:", err);
        alert("Could not load indicator details.");
    }
}


async function submitToNPA(planId) {
    const result = await Swal.fire({
        title: 'Submit to NPA?',
        text: "This will lock the plan and notify the National Planning Authority. You won't be able to undo this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#198754', // Success green
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, Submit Plan',
        cancelButtonText: 'Wait, go back'
    });

    if (result.isConfirmed) {
        // Show loading state
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