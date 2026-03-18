/**
 * Strategic Plan Editor JS - Unified Final Version
 * Handles Objectives, Outcomes, Intermediates, Interventions, Outputs, and Actions
 */

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

async function prepareActionModal(spOutputId, existingData = null) {
    const modalEl = document.getElementById('actionModal');
    const form = document.getElementById('actionForm');
    const select = document.getElementById('action_select');
    
    // 1. Reset Form & Set Parent ID
    form.reset();
    document.getElementById('modal_action_output_id').value = spOutputId;
    select.innerHTML = '<option>Loading...</option>';

    try {
        // 2. Fetch National Actions for the dropdown
        const res = await fetch(`/mda/api/library/actions-by-output/${spOutputId}`);
        const actions = await res.json();
        
        select.innerHTML = '<option value="">-- Select Action --</option>';
        actions.forEach(a => {
            select.appendChild(new Option(`${a.actionCode || ''} ${a.action}`, a.id));
        });

        // 3. Populate Data if in EDIT MODE
        if (existingData) {
            form.querySelector('[name="id"]').value = existingData.id;
            form.querySelector('[name="outputActionId"]').value = existingData.outputActionId;
            
            // Handle Adaptation Toggle
            const adaptToggle = document.getElementById('action_adapt_toggle');
            const adaptContainer = document.getElementById('action_adaptation_container');
            
            if (existingData.adaptedOutputAction) {
                adaptToggle.checked = true;
                adaptContainer.style.display = 'block';
                form.querySelector('[name="adaptedOutputAction"]').value = existingData.adaptedOutputAction;
            } else {
                adaptToggle.checked = false;
                adaptContainer.style.display = 'none';
            }

            // NEW: Set the Office and Budget Source Dropdowns
            if (existingData.responsibleOfficeId) {
                form.querySelector('[name="responsibleOfficeId"]').value = existingData.responsibleOfficeId;
            }
            if (existingData.budgetSourceId) {
                form.querySelector('[name="budgetSourceId"]').value = existingData.budgetSourceId;
            }

            // Populate Budgets
            if (existingData.Budgets) {
                existingData.Budgets.forEach(b => {
                    const budgetInput = form.querySelector(`[name="budgets[${b.fy}]"]`);
                    if (budgetInput) budgetInput.value = b.val;
                });
            }
        }

        // 4. Show the Modal
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
    } catch (e) { 
        console.error("Error preparing action modal:", e); 
        alert("Failed to load actions. Please try again.");
    }
}

document.getElementById('actionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = document.querySelector('button[form="actionForm"]');
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

    // 1. Convert FormData to a structured Object
    const payload = {
        id: formData.get('id') || null,
        spOutputId: formData.get('spOutputId'),
        outputActionId: formData.get('outputActionId'),
        // planId REMOVED - The backend now traces this via spOutputId
        
        // Use ID fields to match your updated controller & model
        responsibleOfficeId: formData.get('responsibleOfficeId'),
        budgetSourceId: formData.get('budgetSourceId'),
        
        adaptedOutputAction: document.getElementById('action_adapt_toggle').checked 
            ? formData.get('adaptedOutputAction') 
            : null,
        budgets: {}
    };

    // 2. Extract Budget values dynamically
    formData.forEach((value, key) => {
        if (key.startsWith('budgets[')) {
            // Updated regex to handle year formats like "2025/26" or "2025"
            const yearMatch = key.match(/budgets\[([^\]]+)\]/);
            if (yearMatch && value.trim() !== '') {
                const year = yearMatch[1];
                // Clean commas and whitespace
                payload.budgets[year] = value.replace(/,/g, '').trim();
            }
        }
    });

    try {
        const response = await fetch('/mda/api/plan/save-output-action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.status === 'success') {
            // Success! Reload to show the new data in the tree
            location.reload(); 
        } else {
            throw new Error(result.message || 'Failed to save action');
        }
    } catch (error) {
        console.error('Save Error:', error);
        // Using alert for now, but Swal.fire() is better if you have SweetAlert2
        alert('Error saving action: ' + error.message);
    } finally {
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
            adaptField: 'adaptedOutcomeIndicator', indIdField: 'outcomeIndicatorId'
        },
        'intermediate': { 
            modal: 'intermediateIndicatorModal', form: 'intIndicatorForm', select: 'intermediate_indicator_select', 
            hidden: 'modal_intermediate_parent_id', toggle: 'int_adapt_toggle', container: 'int_adaptation_container', 
            api: `/mda/api/library/intermediate-indicators/${parentId}`,
            adaptField: 'adaptedIntermediateOutcomeIndicator', indIdField: 'intermediateOutcomeIndicatorId'
        },
        'output': { 
            modal: 'outputIndicatorModal', form: 'outputIndicatorForm', select: 'output_indicator_select', 
            hidden: 'modal_output_parent_id', toggle: 'output_adapt_toggle', container: 'output_adaptation_container', 
            api: `/mda/api/library/output-indicators/${parentId}`,
            adaptField: 'adaptedOutputIndicator', indIdField: 'outputIndicatorId'
        }
    }[lwr];

    const form = document.getElementById(config.form);
    if (!form) return;

    // 1. Reset Form & Set Parent ID
    form.reset(); 
    if (form.querySelector('[name="id"]')) form.querySelector('[name="id"]').value = existingData?.id || '';
    document.getElementById(config.hidden).value = parentId;

    // 2. Load Library Options
    const selectEl = document.getElementById(config.select);
    selectEl.innerHTML = '<option>Loading indicators...</option>';
    
    // Show Modal immediately for better UX
    bootstrap.Modal.getOrCreateInstance(document.getElementById(config.modal)).show();

    try {
        const res = await fetch(config.api);
        const indicators = await res.json();

        selectEl.innerHTML = `<option value="">-- Select ${level} Indicator --</option>`;
        indicators.forEach(ind => {
            const text = ind.indicator || ind.indicatorName || ind.intermediate_outcome_indicator || ind.output_indicator;
            selectEl.appendChild(new Option(text, ind.id));
        });

        // 3. POPULATE EDIT DATA (If editing)
        if (existingData) {
            // Set Library Selection
            selectEl.value = existingData[config.indIdField];

            // Set Baseline and NEW fields
            if (form.querySelector('[name="baselineValue"]')) 
                form.querySelector('[name="baselineValue"]').value = existingData.baselineValue || '';
            
            if (form.querySelector('[name="responsibleOfficeId"]')) 
                form.querySelector('[name="responsibleOfficeId"]').value = existingData.responsibleOfficeId || '';
            
            if (form.querySelector('[name="dataSource"]')) 
                form.querySelector('[name="dataSource"]').value = existingData.dataSource || '';

            // Handle Adaptation
            const adaptContent = existingData[config.adaptField];
            if (adaptContent) {
                document.getElementById(config.toggle).checked = true;
                document.getElementById(config.container).style.display = 'block';
                form.querySelector(`textarea[name="${config.adaptField}"]`).value = adaptContent;
            } else {
                document.getElementById(config.toggle).checked = false;
                document.getElementById(config.container).style.display = 'none';
            }

            // Populate Targets
            // Assuming your backend includes the targets in a 'SelectedTargets' or 'Targets' array
            const targets = existingData.SelectedTargets || existingData.Targets || [];
            targets.forEach(t => {
                const targetInput = form.querySelector(`input[name="targets[${t.fy}]"]`);
                if (targetInput) targetInput.value = t.val;
            });
        }

    } catch (err) {
        console.error("Indicator Load Error:", err);
        selectEl.innerHTML = '<option>Error loading library</option>';
    }
}
async function editIndicator(level, id) {
    const lwr = level.toLowerCase();
    const config = {
        'outcome': { 
            modal: 'outcomeIndicatorModal', form: 'outcomeIndicatorForm', select: 'outcome_indicator_select',
            toggle: 'outcome_adapt_toggle', container: 'outcome_adaptation_container',
            parentIdField: 'spOutcomeId', adaptField: 'adaptedOutcomeIndicator',
            fetchUrl: (pid) => `/mda/api/library-indicators-by-outcome/${pid}`
        },
        'intermediate': { 
            modal: 'intermediateIndicatorModal', form: 'intIndicatorForm', select: 'intermediate_indicator_select',
            toggle: 'int_adapt_toggle', container: 'int_adaptation_container',
            parentIdField: 'spIntermediateOutcomeId', adaptField: 'adaptedIntermediateOutcomeIndicator',
            fetchUrl: (pid) => `/mda/api/library/intermediate-indicators/${pid}`
        },
        'output': { 
            modal: 'outputIndicatorModal', form: 'outputIndicatorForm', select: 'output_indicator_select',
            toggle: 'output_adapt_toggle', container: 'output_adaptation_container',
            parentIdField: 'spOutputId', adaptField: 'adaptedOutputIndicator',
            fetchUrl: (pid) => `/mda/api/library/output-indicators/${pid}`
        }
    }[lwr];

    try {
        const res = await fetch(`/mda/api/plan/indicator-details/${lwr}/${id}`);
        const data = await res.json();
        const form = document.getElementById(config.form);

        // 1. Populate Library Dropdown
        const parentId = data[config.parentIdField];
        
        // --- STEP 1.5: THE MISSING LINK ---
        // Find the hidden input (e.g., #modal_outcome_parent_id) and set its value
        const parentIdInput = form.querySelector(`[name="${config.parentIdField}"]`);
        if (parentIdInput) {
            parentIdInput.value = parentId || '';
            console.log(`Debug: Set ${config.parentIdField} to ${parentId}`);
        }
        // ----------------------------------

        if (parentId) {
            const listRes = await fetch(config.fetchUrl(parentId));
            const indicators = await listRes.json();
            const selectEl = document.getElementById(config.select);
            selectEl.innerHTML = '<option value="">Select Indicator...</option>';
            indicators.forEach(ind => {
                const text = ind.indicator || ind.indicatorName || ind.intermediate_outcome_indicator || ind.output_indicator;
                const opt = new Option(text, ind.id);
                selectEl.appendChild(opt);
            });
            selectEl.value = data.outcomeIndicatorId || data.intermediateOutcomeIndicatorId || data.outputIndicatorId;
        }

        // 2. Fill Basic Fields
        form.querySelector('[name="id"]').value = id;
        form.querySelector('[name="baselineValue"]').value = data.baselineValue || '';
        
        const officeSelect = form.querySelector('[name="responsibleOfficeId"]');
        if (officeSelect) officeSelect.value = data.responsibleOfficeId || '';

        const sourceInput = form.querySelector('[name="dataSource"]');
        if (sourceInput) sourceInput.value = data.dataSource || '';

        // 3. Handle Adaptation
        const adaptText = data[config.adaptField];
        const toggle = document.getElementById(config.toggle);
        const container = document.getElementById(config.container);
        const textarea = form.querySelector('textarea');

        if (adaptText && adaptText !== '0' && adaptText !== '') {
            toggle.checked = true;
            container.style.display = 'block';
            if (textarea) textarea.value = adaptText;
        } else {
            toggle.checked = false;
            container.style.display = 'none';
            if (textarea) textarea.value = '';
        }

        // 4. Fill Yearly Targets
        form.querySelectorAll('input[name^="targets["]').forEach(input => input.value = '');
        
        const targetList = data.Targets || data.SelectedTargets || [];
        targetList.forEach(t => {
            const targetInput = form.querySelector(`[name="targets[${t.fy}]"]`);
            if (targetInput) targetInput.value = t.val;
        });

        // 5. Show the modal
        bootstrap.Modal.getOrCreateInstance(document.getElementById(config.modal)).show();
    } catch (err) {
        console.error("Edit Load Error:", err);
        alert("Could not load indicator details.");
    }
}