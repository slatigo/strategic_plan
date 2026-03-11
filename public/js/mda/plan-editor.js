/**
 * Strategic Plan Editor JS
 * Handles results chain nesting and data persistence
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Objective Setup (Top Level) ---
    const librarySelect = document.getElementById('library_id');
    const orgDescription = document.getElementById('org_description') || document.getElementById('orgObjective');
    const saveBtn = document.getElementById('saveObjectiveBtn');

    if (librarySelect && orgDescription) {
        librarySelect.addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            orgDescription.value = selectedOption.getAttribute('data-name') || '';
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const planId = document.getElementById('plan_id')?.value;
            return console.log(planId)
            if (!planId || !librarySelect.value) return Swal.fire('Error', 'Missing Plan ID or Objective selection', 'error');

            const data = {
                planId: planId,
                objective_id: librarySelect.value,
                org_objective: orgDescription.value
            };

            try {
                const response = await fetch('/mda/plans/objectives/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (result.status === 'success') {
                    location.reload();
                } else {
                    Swal.fire('Warning', result.message, 'warning');
                }
            } catch (err) {
                Swal.fire('Error', 'Failed to save objective', 'error');
            }
        });
    }

    // --- 2. Outcome Setup ---
    const saveOutcomeBtn = document.getElementById('saveOutcomeBtn');
    if (saveOutcomeBtn) {
        saveOutcomeBtn.addEventListener('click', async () => {
            const data = {
                sp_objective_id: document.getElementById('modal_sp_objective_id').value,
                outcome_id: document.getElementById('outcome_library_id').value
            };

            const response = await fetch('/mda/plans/outcomes/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.status === 'success') location.reload();
            else Swal.fire('Warning', result.message, 'warning');
        });
    }

    // --- 3. Indicator & Targets Setup (The New Vertical Logic) ---
    const indicatorForm = document.getElementById('indicatorForm');
    if (indicatorForm) {
        indicatorForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const data = {
                spOutcomeId: formData.get('spOutcomeId'),
                outcomeIndicatorId: formData.get('outcomeIndicatorId'),
                baselineValue: formData.get('baselineValue'),
                planId: document.getElementById('planId')?.value, // Required for targets
                targets: {}
            };

            // Capture yearly targets
            [2025, 2026, 2027, 2028, 2029].forEach(year => {
                const val = formData.get(`targets[${year}]`);
                if (val) data.targets[year] = val;
            });

            try {
                const response = await fetch('/mda/plans/indicators/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (result.status === 'success') {
                    Swal.fire('Saved', 'Indicator and Targets updated', 'success').then(() => location.reload());
                } else {
                    Swal.fire('Error', result.message, 'error');
                }
            } catch (err) {
                Swal.fire('Error', 'Communication failure', 'error');
            }
        });
    }
});

// --- GLOBAL MODAL HELPERS ---

/**
 * Prepares the Outcome Modal with relevant library data
 */
async function prepareOutcomeModal(spObjectiveId, libraryObjectiveId, objName) {
    const outcomeSelect = document.getElementById('outcome_library_id');
    const displayObj = document.getElementById('display_obj_name');
    const hiddenInput = document.getElementById('modal_sp_objective_id');

    if (hiddenInput) hiddenInput.value = spObjectiveId;
    if (displayObj) displayObj.innerText = objName;

    try {
        const res = await fetch(`/mda/api/library-outcomes?objectiveId=${libraryObjectiveId}&spObjectiveId=${spObjectiveId}`);
        const outcomes = await res.json();

        if (outcomeSelect) {
            outcomeSelect.innerHTML = '<option value="" disabled selected>-- Select Outcome --</option>';
            outcomes.forEach(o => {
                outcomeSelect.innerHTML += `<option value="${o.id}">${o.outcomeCode}: ${o.outcomeName}</option>`;
            });
        }
        const modal = new bootstrap.Modal(document.getElementById('addOutcomeModal'));
        modal.show();
    } catch (err) {
        Swal.fire('Error', 'Could not load library outcomes', 'error');
    }
}

/**
 * Prepares the Indicator Modal and fetches indicators for that specific outcome
 */
async function prepareIndicatorModal(spOutcomeId) {
    const modalEl = document.getElementById('addIndicatorModal');
    if (!modalEl) return;

    const modal = new bootstrap.Modal(modalEl);
    const indicatorSelect = document.getElementById('library_indicator_select');
    const hiddenIdInput = document.getElementById('modal_oc_id');
    
    if (hiddenIdInput) hiddenIdInput.value = spOutcomeId;
    if (indicatorSelect) indicatorSelect.innerHTML = '<option value="">Loading...</option>';

    modal.show();

    try {
        // Fix for your 404: Ensure this path matches your router prefix exactly
        const response = await fetch(`/mda/api/library-indicators-by-outcome/${spOutcomeId}`);
        if (!response.ok) throw new Error('API not found');
        
        const indicators = await response.json();

        if (Array.isArray(indicators) && indicatorSelect) {
            indicatorSelect.innerHTML = '<option value="">-- Select Indicator --</option>';
            indicators.forEach(ind => {
                indicatorSelect.innerHTML += `<option value="${ind.id}">${ind.indicatorCode || ''} ${ind.indicator}</option>`;
            });
        }
    } catch (err) {
        console.error("Indicator Fetch Error:", err);
        if (indicatorSelect) indicatorSelect.innerHTML = '<option value="">Error loading indicators</option>';
    }
}

/**
 * Prepares Intermediate Outcome Modal
 */
async function prepareIntermediateModal(spOutcomeId) {
    const hiddenIdInput = document.getElementById('parentOutcomeId');
    if (hiddenIdInput) hiddenIdInput.value = spOutcomeId;
    
    // Logic for loading library data would go here (similar to indicators)
    const modal = new bootstrap.Modal(document.getElementById('addIntermediateModal'));
    modal.show();
}

// Ensure functions are available globally for pug onclicks
window.prepareOutcomeModal = prepareOutcomeModal;
window.prepareIndicatorModal = prepareIndicatorModal;
window.prepareIntermediateModal = prepareIntermediateModal;